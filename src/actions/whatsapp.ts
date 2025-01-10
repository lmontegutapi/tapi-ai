"use server";

import { prisma } from "@/lib/db";
import { session as serverSession } from "@/lib/auth-server";
import { formatCurrency } from "@/lib/utils";
import axios from "axios";


export async function sendWhatsappNotification(receivableId: string) {
  const session = await serverSession();
  if (!session) {
    return { success: false, error: "No se pudo obtener la sesión del usuario" };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.id },
  });

  if (!organization) {
    return { success: false, error: "Organización no encontrada" };
  }

  const receivable = await prisma.receivable.findUnique({
    where: { id: receivableId },
    include: { contact: true },
  });

  if (!receivable) {
    return { success: false, error: "Recibo no encontrado" };
  }

  const contact = receivable.contact;
  if (!contact) {
    return { success: false, error: "Contacto no encontrado" };
  }

  const amountFormatted = formatCurrency(receivable.amountCents);
  const linkPortalContact = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${contact.id}`;

  const bodyWhatsappMessage = {
    companyName: organization.name,
    amount: amountFormatted,
    expirationDate: receivable.dueDate,
    phone: contact.phone,
    link: linkPortalContact,
  }

  const result = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/send-message`, bodyWhatsappMessage);

  if (result.status !== 200) {
    return { success: false, error: "Error al enviar el mensaje de whatsapp" };
  }

  return { success: true, data: result };
}