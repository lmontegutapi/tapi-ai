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

  console.log("session", session)

  const organization = await prisma.organization.findUnique({
    where: { id: session.session.activeOrganizationId! },
  });

  if (!organization) {
    return { success: false, error: "Organización no encontrada" };
  }

  console.log("organization", organization)

  const receivable = await prisma.receivable.findUnique({
    where: { id: receivableId },
    include: { contact: true },
  });

  console.log("receivable", receivable)

  if (!receivable) {
    return { success: false, error: "Recibo no encontrado" };
  }

  console.log("receivable", receivable)

  const contact = receivable.contact;
  if (!contact) {
    return { success: false, error: "Contacto no encontrado" };
  }

  console.log("contact", contact)

  const amountFormatted = formatCurrency(receivable.amountCents);

  const bodyWhatsappMessage = {
    companyName: organization.name,
    amount: amountFormatted,
    expirationDate: receivable.dueDate,
    phone: contact.phone,
    contactId: contact.id,
  }

  console.log("bodyWhatsappMessage", bodyWhatsappMessage)

  const result = await axios.post(`${process.env.TAPI_AWS_WHATSAPP_URL}`, {
    messages: [bodyWhatsappMessage]
  }, {
    headers: {
      'x-api-key': process.env.TAPI_AWS_WHATSAPP_API_KEY,
    },
  });

  console.log("result whatsapp", result)

  if (result.status !== 200) {
    return { success: false, error: "Error al enviar el mensaje de whatsapp" };
  }

  return { success: true, data: result.data };
}
