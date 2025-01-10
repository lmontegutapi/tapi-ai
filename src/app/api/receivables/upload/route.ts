import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { chunk } from 'lodash';
import { Redis } from 'ioredis';
import { Prisma, Contact, ContactPhone } from '@prisma/client';

// Configuración
const CONFIG = {
  CHUNK_SIZE: 50,
  MAX_RECORDS: 500, // Ajustado para límites de Vercel
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  RATE_LIMIT: {
    points: 1000, // Incrementado para desarrollo
    duration: 60 * 60, // 1 hora
  },
  CACHE_TTL: 60 * 60 * 24, // 24 horas
};

// Inicializar Redis
const redis = new Redis(process.env.REDIS_URL!);

// Rate limiting
async function checkRateLimit(organizationId: string): Promise<boolean> {
  const key = `ratelimit:bulk:${organizationId}`;
  const multi = redis.multi();
  
  multi.get(key);
  multi.ttl(key);
  
  console.log(`Checking rate limit for organization: ${organizationId}`);
  
  const result = await multi.exec();
  if (!result) {
    console.log("No rate limit data found, allowing to proceed");
    return true;
  }
  
  const [pointsResult] = result;
  const points = String(pointsResult?.[1] || '');
  
  console.log(`Rate limit points: ${points}`);
  
  if (!points) {
    console.log("No points found, setting new limit");
    await redis.setex(key, CONFIG.RATE_LIMIT.duration, CONFIG.RATE_LIMIT.points - 1);
    return true;
  }
  
  const pointsRemaining = parseInt(points);
  console.log(`Points remaining: ${pointsRemaining}`);
  
  if (pointsRemaining <= 0) {
    console.log("Limit exceeded, denying access");
    return false;
  }
  
  console.log("Decrementing points, allowing access");
  await redis.decrby(key, 1);
  return true;
}

async function processDataInChunks(data: any[], organizationId: string, tx: any) {
  console.log('Iniciando procesamiento de datos:', { 
    totalRecords: data.length, 
    organizationId 
  });

  const chunks = chunk(data, CONFIG.CHUNK_SIZE);
  const results = [];

  // Verificar datos de entrada
  if (!data.length) {
    console.log('No hay datos para procesar');
    return [];
  }

  // Procesar contactos
  const contactsToProcess = new Map<string, any>();
  
  // Primero verificar si ya existen receivables
  interface RowData {
    [key: string]: string;
  }

  const identifiers = data.map((row: RowData) => {
    const [identifier] = Object.values(row)[0].split(',');
    return identifier;
  });

  console.log('Identificadores a procesar:', identifiers);

  const existingReceivables = await tx.receivable.findMany({
    where: {
      organizationId,
      identifier: {
        in: identifiers
      }
    },
    select: {
      identifier: true
    }
  });

  console.log('Receivables existentes:', existingReceivables);

  const existingIdentifiers = new Set(existingReceivables.map((r: { identifier: string }) => r.identifier));

  // Filtrar solo los nuevos registros
  const newData = data.filter((row: RowData) => {
    const [identifier] = Object.values(row)[0].split(',');
    return !existingIdentifiers.has(identifier);
  });

  console.log('Nuevos registros a procesar:', newData.length);

  // Parsear los datos del archivo
  newData.forEach((row: RowData) => {
    const rowValues = Object.values(row)[0].split(',');
    console.log('Procesando fila:', rowValues);

    const [
      identifier,
      name,
      phone,
      amountCents,
      dueDate,
      additionalPhones,
      email,
      rfc,
      address,
      notes
    ] = rowValues;

    if (!identifier || !name || !phone || !amountCents || !dueDate) {
      console.error('Datos requeridos faltantes:', { identifier, name, phone, amountCents, dueDate });
      throw new Error(`Datos requeridos faltantes para el registro con identificador: ${identifier}`);
    }

    contactsToProcess.set(identifier, {
      identifier,
      name,
      phone,
      amountCents,
      dueDate,
      additionalPhones,
      email,
      rfc,
      address,
      notes,
      phones: [phone, ...(additionalPhones ? additionalPhones.split(',').filter(Boolean) : [])]
    });
  });

  console.log('Contactos a procesar:', contactsToProcess.size);

  // Crear o actualizar contactos
  const contactsMap = new Map<string, Contact>();

  for (const [identifier, contactData] of contactsToProcess.entries()) {
    try {
      // Buscar contacto existente
      let contact = await tx.contact.findUnique({
        where: { 
          organizationId_identifier: { 
            organizationId, 
            identifier 
          } 
        }
      });

      console.log('Contacto existente:', contact?.id);

      // Si no existe, crear nuevo contacto
      if (!contact) {
        contact = await tx.contact.create({
          data: {
            organizationId,
            identifier,
            name: contactData.name,
            phone: contactData.phone?.trim() || null,
            email: contactData.email || null,
            rfc: contactData.rfc || null,
            address: contactData.address || null,
          }
        });

        console.log('Nuevo contacto creado:', contact.id);

        // Crear solo los teléfonos adicionales
        const additionalPhones = contactData.phones
          .slice(1)
          .filter(Boolean)
          .map((phone: string) => ({
            contactId: contact.id,
            phone: phone.trim(),
            type: 'OTHER' as const,
            isPrimary: false
          }));

        if (additionalPhones.length > 0) {
          const createdPhones = await tx.contactPhone.createMany({
            data: additionalPhones,
            skipDuplicates: true
          });
          console.log('Teléfonos adicionales creados:', createdPhones);
        }
      }

      contactsMap.set(identifier, contact);
    } catch (error) {
      console.error('Error procesando contacto:', { identifier, error });
      throw error;
    }
  }

  // Procesar receivables en chunks
  for (const chunk of chunks) {
    try {
      const receivablesData = chunk.map((row: RowData) => {
        const [identifier] = Object.values(row)[0].split(',');
        const contact = contactsMap.get(identifier);
        
        if (!contact) {
          throw new Error(`No se encontró contacto para el identificador: ${identifier}`);
        }

        const contactData = contactsToProcess.get(identifier);
        
        return {
          organizationId,
          contactId: contact.id,
          identifier,
          amountCents: parseInt(contactData.amountCents),
          dueDate: new Date(contactData.dueDate),
          status: 'OPEN',
          notes: contactData.notes || null
        };
      });

      console.log('Creando receivables:', receivablesData.length);

      const createdReceivables = await tx.receivable.createMany({
        data: receivablesData,
        skipDuplicates: true
      });

      console.log('Receivables creados:', createdReceivables);

      results.push(...receivablesData);
    } catch (error) {
      console.error('Error procesando chunk de receivables:', error);
      throw error;
    }
  }

  console.log('Proceso completado. Total resultados:', results.length);
  return results;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Método no permitido' }, 
      { status: 405 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    if (!file || !organizationId) {
      return NextResponse.json(
        { success: false, error: "Archivo y organización son requeridos" },
        { status: 400 }
      );
    }

    // Validar tamaño de archivo
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Archivo excede el tamaño máximo permitido" },
        { status: 400 }
      );
    }

    // Rate limiting
    const canProceed = await checkRateLimit(organizationId);
    if (!canProceed) {
      return NextResponse.json(
        { success: false, error: "Límite de procesamiento excedido. Intente más tarde." },
        { status: 429 }
      );
    }

    // Calcular hash del archivo para caché
    const fileBuffer = await file.arrayBuffer();
    const fileHash = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashString = Array.from(new Uint8Array(fileHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Verificar caché
    const cachedResult = await redis.get(`result:${hashString}`);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cachedResult),
        cached: true
      });
    }

    // Leer archivo
    const workbook = XLSX.read(fileBuffer, {
      raw: false,
      cellDates: true,
      dateNF: 'yyyy-mm-dd'
    });
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: ""
    });

    // Validar número máximo de registros
    if (jsonData.length > CONFIG.MAX_RECORDS) {
      return NextResponse.json(
        { success: false, error: `Máximo ${CONFIG.MAX_RECORDS} registros permitidos` },
        { status: 400 }
      );
    }

    // Procesar datos en transacción
    const results = await prisma.$transaction(async (tx) => {
      return await processDataInChunks(jsonData, organizationId, tx);
    }, {
      timeout: 58000, // Ajustado para límite de Vercel
      maxWait: 59000,
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    });

    // Cachear resultados
    await redis.setex(
      `result:${hashString}`,
      CONFIG.CACHE_TTL,
      JSON.stringify(results)
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
    
  } catch (error) {
    console.error("Error procesando archivo:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error procesando archivo",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}