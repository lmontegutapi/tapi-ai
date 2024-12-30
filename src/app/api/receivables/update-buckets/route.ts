import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
 try {
   const today = new Date('2024-12-27');
   const oldReceivables = [
     {
       identifier: "OLD001",
       dueDate: "2024-08-15",
       amountCents: 250000
     },
     {
       identifier: "OLD002", 
       dueDate: "2024-09-01",
       amountCents: 180000
     },
     {
       identifier: "OLD003",
       dueDate: "2024-07-20", 
       amountCents: 450000
     }
   ];

   // Crear deudas viejas
   for (const receivable of oldReceivables) {
     await prisma.receivable.create({
       data: {
         ...receivable,
         status: "OPEN",
         isOpen: true,
         dueDate: new Date(receivable.dueDate),
         organizationId: "tu_organization_id", // Reemplazar con tu ID real
         contactId: "id_de_un_contacto", // Reemplazar con un ID real
         notes: "Deuda histórica"
       }
     });
   }

   // Actualizar buckets de todas las deudas
   const receivables = await prisma.receivable.findMany({
     where: { isOpen: true }
   });

   for (const receivable of receivables) {
     const daysDiff = Math.floor((today.getTime() - receivable.dueDate.getTime()) / (1000 * 60 * 60 * 24));
     let bucket: "CURRENT" | "PAST_DUE_15" | "PAST_DUE_30" | "PAST_DUE_60" | "PAST_DUE_90" | "PAST_DUE_OVER_90";

     if (daysDiff <= 0) bucket = 'CURRENT';
     else if (daysDiff <= 15) bucket = 'PAST_DUE_15';
     else if (daysDiff <= 30) bucket = 'PAST_DUE_30';
     else if (daysDiff <= 60) bucket = 'PAST_DUE_60';
     else if (daysDiff <= 90) bucket = 'PAST_DUE_90';
     else bucket = 'PAST_DUE_OVER_90';

     await prisma.receivable.update({
       where: { id: receivable.id },
       data: { delinquencyBucket: bucket }
     });
   }

   return NextResponse.json({ success: true });
 } catch (error) {
   console.error('Error updating buckets:', error);
   return NextResponse.json({ success: false, error: "Error updating buckets" }, { status: 500 });
 }
}