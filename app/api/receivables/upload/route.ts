import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import * as XLSX from 'xlsx';

// Define el esquema de la estructura objetivo
const debtSchema = z.object({
  identifier: z.string().optional(),
  amount: z.number(),
  dueDate: z.string().datetime(),
  contactName: z.string(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  metadata: z.record(z.any()).optional(),
});

// Función para validar el formato del archivo
export async function validateExcelFormat(file: File): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      return {
        success: false,
        error: 'Formato de archivo no válido. Use Excel o CSV',
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return {
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al validar el archivo',
    };
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó un archivo' }, { status: 400 });
    }

    // Validar el archivo
    const validation = await validateExcelFormat(file);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Procesar el archivo
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Usar AI SDK para mapear los datos
    const { object: mappedData } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        receivables: z.array(debtSchema),
      }),
      prompt: `Analiza los siguientes datos del Excel y mapea a la estructura objetivo: 
      ${JSON.stringify(jsonData)}`,
    });

    console.log("mappedData from api", mappedData)

    return NextResponse.json({ success: true, data: mappedData.receivables });
  } catch (error) {
    console.error('Error procesando archivo:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando archivo' },
      { status: 500 }
    );
  }
}
