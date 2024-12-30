import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";

export const maxDuration = 300;

// Schemas
const rawDataSchema = z.object({
 identifier: z.string(),
 name: z.string(),
 phone: z.string(),
 amountCents: z.string(),
 dueDate: z.string(),
 email: z.string().optional(),
 rfc: z.string().optional(),
 address: z.string().optional(),
 additionalPhones: z.string().optional(),
 notes: z.string().optional()
});

const contactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  identifier: z.string(),
  email: z.string().email().optional().nullable(), // Cambio aquí
  rfc: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  additionalPhones: z.string().optional().nullable(),
});

const debtSchema = z.object({
 identifier: z.string(),
 amountCents: z.coerce.number(),
 dueDate: z.string().datetime(),
 notes: z.string().optional(),
 contact: contactSchema,
});

/* async function findOrCreateContact(contactData: any, organizationId: string, tx: any) {

  console.log("Creating contact with organizationId: 111", organizationId);
 let contact = await tx.contact.findFirst({
   where: {
     organizationId,
     OR: [
       { identifier: contactData.identifier },
       { phone: contactData.phone },
       { email: contactData.email },
     ],
   },
   include: {
     contactPhone: true,
   },
 });

 console.log("Creating contact with organizationId: 222", organizationId);

 if (!contact && organizationId) {
   contact = await tx.contact.create({
     data: {
       organizationId,
       name: contactData.name,
       identifier: contactData.identifier,
       email: contactData.email || null,
       phone: contactData.phone,
       rfc: contactData.rfc || null,
       address: contactData.address || null,
       createdAt: new Date(),
       updatedAt: new Date(),
       contactPhone: {
         create: [
           { phone: contactData.phone, type: "MAIN", isPrimary: true, createdAt: new Date(), updatedAt: new Date() },
           ...(contactData.additionalPhones?.split(",").map((phone: string) => ({
             phone: phone.trim(),
             type: "OTHER",
             isPrimary: false,
             createdAt: new Date(),
             updatedAt: new Date()
           })) ?? []),
         ],
       },
     },
     include: {
       contactPhone: true,
     },
   });
 }

 return contact;
}
 */

async function findOrCreateContact(contactData: any, organizationId: string, tx: any) {
  const contact = await tx.contact.findFirst({
    where: {
      organizationId,
      OR: [
        { phone: contactData.phone },
        { email: contactData.email }
      ]
    }
  });

  if (!contact) {
    return await tx.contact.create({
      data: {
        organizationId,
        name: contactData.name,
        email: contactData.email || null,
        phone: contactData.phone,
        identifier: contactData.identifier,
        rfc: contactData.rfc || null,
        address: contactData.address || null,
        contactPhone: {
          create: {
            phone: contactData.phone,
            type: "MAIN",
            isPrimary: true
          }
        }
      }
    });
  }

  return contact;
}

async function validateExcelFormat(file: File): Promise<{
 success: boolean;
 error?: string;
}> {
 try {
   const validExtensions = [".xlsx", ".xls", ".csv"];
   const fileName = file.name.toLowerCase();
   const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

   if (!isValidExtension) {
     return {
       success: false,
       error: "Formato de archivo no válido. Use Excel o CSV",
     };
   }

   if (file.size > 5 * 1024 * 1024) {
     return {
       success: false,
       error: "El archivo es demasiado grande. Máximo 5MB",
     };
   }

   const buffer = await file.arrayBuffer();
   const workbook = XLSX.read(buffer, {
     raw: false,
     cellDates: true,
     dateNF: 'yyyy-mm-dd'
   });
   
   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
   const headers = XLSX.utils.sheet_to_json(worksheet, { 
     header: 1,
     raw: false,
     defval: ""
   })[0] as string[];

   const requiredHeaders = [
     "identifier",
     "name", 
     "phone",
     "amountCents",
     "dueDate"  
   ];
   
   const missingHeaders = requiredHeaders.filter(
     header => !headers.some(h => h === header)
   );

   if (missingHeaders.length > 0) {
     return {
       success: false,
       error: `Faltan columnas requeridas: ${missingHeaders.join(", ")}`,
     };
   }

   return {
     success: true,
   };
 } catch (error) {
   console.error("Error validando archivo:", error);
   return {
     success: false,
     error: "Error al validar el archivo",
   };
 }
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

   const validation = await validateExcelFormat(file);
   if (!validation.success) {
     return NextResponse.json(
       { success: false, error: validation.error },
       { status: 400 }
     );
   }

   const buffer = await file.arrayBuffer();
   const workbook = XLSX.read(buffer, {
     raw: false,
     cellDates: true,
     dateNF: 'yyyy-mm-dd'
   });
   
   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
   const jsonData = XLSX.utils.sheet_to_json(worksheet, {
     raw: false,
     defval: ""
   });

   const { object: mappedData } = await generateObject({
     model: openai("gpt-4o-mini"),
     schema: z.object({
       receivables: z.array(debtSchema),
     }),
     prompt: `Mapea los siguientes datos a receivables. Para emails inválidos o vacíos, usa null.
      Datos: ${JSON.stringify(jsonData)}`,
   });

   console.log("mappedData", mappedData);

   const results = await prisma.$transaction(async (tx) => {
    const createdData = [];

    for (const item of mappedData.receivables) {
      const contact = await findOrCreateContact(item.contact, organizationId, tx);
      
      const receivable = await tx.receivable.create({
        data: {
          organizationId,
          contactId: contact.id,
          amountCents: item.amountCents,
          dueDate: new Date(item.dueDate),
          status: "OPEN",
          notes: item.notes || null
        }
      });

      createdData.push(receivable);
    }

    return createdData;
  }, {
    timeout: 20000,
    maxWait: 25000
  });

   return NextResponse.json({
     success: true,
     data: results,
   });
   
 } catch (error) {
   console.error("Error procesando archivo:", error);
   return NextResponse.json(
     { success: false, error: "Error procesando archivo" },
     { status: 500 }
   );
 }
}