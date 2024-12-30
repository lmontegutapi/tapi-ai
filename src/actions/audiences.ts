"use server";

import { prisma } from "@/lib/db";
import { ContactChannel, DelinquencyBucket } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getDelinquencyBucket } from "@/lib/audience-utils";

export async function getAudiences() {
  try {
    const audiences = await prisma.audience.findMany({
      include: {
        campaigns: true
      }
    });

    return { success: true, data: audiences };
  } catch (error) {
    return { error: "Error al obtener audiencias" };
  }
}

export async function createAudience(data: {
  name: string;
  description?: string;
  delinquencyBucket: DelinquencyBucket;
  contactPreference: ContactChannel;
  organizationId: string;
}) {
  try {
    const audience = await prisma.audience.create({
      data: {
        ...data,
        delinquencyBucket: data.delinquencyBucket,
        contactPreference: data.contactPreference,
      }
    });

    revalidatePath("/dashboard/audiences");
    return { success: true, data: audience };
  } catch (error) {
    console.error("Error creating audience:", error);
    return { success: false, error: "Error al crear audiencia" };
  }
}

export async function updateAudience(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    delinquencyBucket: string;
    contactPreference: string;
  }>
) {
  try {
    const audience = await prisma.audience.update({
      where: { id },
      data: {
        ...data,
        delinquencyBucket: data.delinquencyBucket as any,
        contactPreference: data.contactPreference as any
      }
    });
    return { success: true, data: audience };
  } catch (error) {
    return { success: false, error: "Error al actualizar audiencia" };
  }
}

export async function deleteAudience(id: string) {
  try {
    await prisma.audience.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar audiencia" };
  }
}

export async function getAudienceDetails(audienceId: string) {
  const audience = await prisma.audience.findUnique({
    where: { id: audienceId },
    include: {
      campaigns: true,
    }
  });

  if (!audience) return null;

  // Obtener receivables que coincidan con el bucket de la audiencia
  const matchingReceivables = await prisma.receivable.findMany({
    where: {
      organizationId: audience.organizationId,
      delinquencyBucket: audience.delinquencyBucket,
    },
    include: {
      contact: true,
    }
  });

  // Extraer contactos únicos
  const uniqueContacts = [...new Set(matchingReceivables.map(r => r.contact))];

  // Calcular métricas
  const totalAmount = matchingReceivables.reduce((sum, r) => sum + r.amountCents, 0);
  const totalReceivables = matchingReceivables.length;
  const totalContacts = uniqueContacts.length;

  return {
    audience,
    metrics: {
      totalAmount,
      totalReceivables,
      totalContacts,
      campaignsCount: audience.campaigns.length
    },
    receivables: matchingReceivables,
    contacts: uniqueContacts
  };
}

export async function syncAudienceMembers(audienceId: string) {
  try {
    const audience = await prisma.audience.findUnique({
      where: { id: audienceId }
    });

    if (!audience) return { success: false, error: "Audiencia no encontrada" };

    // Buscar receivables que coincidan con el bucket
    const receivables = await prisma.receivable.findMany({
      where: {
        organizationId: audience.organizationId,
        isOpen: true,
        delinquencyBucket: audience.delinquencyBucket
      },
      include: {
        contact: true
      }
    });

    if (receivables.length === 0) {
      return { 
        success: false, 
        error: `No se encontraron deudas para el bucket: ${audience.delinquencyBucket}` 
      };
    }

    // Crear arreglos para las relaciones
    const uniqueContactIds = [...new Set(receivables.map(r => r.contact.id))];
    const receivableIds = receivables.map(r => r.id);

    // Actualizar las relaciones en la base de datos
    await prisma.$executeRaw`
      INSERT INTO "_audience_to_contact" ("A", "B")
      SELECT ${audienceId}, unnest(${uniqueContactIds}::text[])
      ON CONFLICT DO NOTHING;
    `;

    await prisma.$executeRaw`
      INSERT INTO "_audience_to_receivable" ("A", "B")
      SELECT ${audienceId}, unnest(${receivableIds}::text[])
      ON CONFLICT DO NOTHING;
    `;

    return { 
      success: true, 
      data: {
        contactsCount: uniqueContactIds.length,
        receivablesCount: receivableIds.length
      }
    };
  } catch (error) {
    console.error('Error syncing audience:', error);
    return { success: false, error: "Error al sincronizar audiencia" };
  }
}