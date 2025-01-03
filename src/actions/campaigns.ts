"use server";

import { auth } from "@/lib/auth";
import { session as sessionServer } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import type { Organization, Campaign } from "@prisma/client";



type CampaignInput = z.infer<typeof campaignSchema>;

const campaignSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  context: z.string().min(10, "El contexto debe tener al menos 10 caracteres"),
  objective: z.string().min(10, "El objetivo debe tener al menos 10 caracteres"),
  welcomeMessage: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  callsPerUser: z.coerce.number().min(1).max(10),
  agentId: z.string().min(1, "Debes seleccionar un agente"),
  voiceId: z.string().min(1, "Debes seleccionar una voz"),
  voiceName: z.string(),
  voicePreviewUrl: z.string().optional(),
  receivableIds: z.array(z.string()).optional(),
  audienceIds: z.array(z.string()).optional(),
});

export async function createCampaign(data: z.infer<typeof campaignSchema>) {
  try {
    const session = await sessionServer();
    if (!session) return { success: false, error: "No autorizado" };

    const organization = await prisma.organization.findFirst({
      where: {
        members: { some: { userId: session.user.id } }
      }
    });

    if (!organization) return { success: false, error: "Organización no encontrada" };

    // Buscar audiencias
    const audiences = await prisma.audience.findMany({
      where: { 
        id: { in: data.audienceIds || [] },
        organizationId: organization.id
      }
    });

    // Obtener contactos para las audiencias mediante consulta raw
    const contacts = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT c.id 
      FROM "contact" c
      JOIN "_audience_to_contact" a2c ON c.id = a2c."B"
      WHERE a2c."A" IN (${data.audienceIds?.join(',')})
      AND c."organizationId" = ${organization.id}
    `;

    // Obtener receivables para las audiencias mediante consulta raw
    const receivables = await prisma.$queryRaw<{ id: string }[]>`
      SELECT r.id 
      FROM "receivable" r
      JOIN "_audience_to_receivable" a2r ON r.id = a2r."B"
      WHERE a2r."A" IN (${data.audienceIds?.join(',')})
      AND r."isOpen" = true 
      AND r."campaignId" IS NULL
      AND r."organizationId" = ${organization.id}
    `;

    if (receivables.length === 0) {
      return { 
        success: false, 
        error: "Las audiencias seleccionadas no tienen deudas activas" 
      };
    }

    // Extraer IDs de contactos y receivables
    const contactIds = contacts.map(c => c.id);
    const receivableIds = receivables.map(r => r.id);

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        context: data.context,
        objective: data.objective,
        welcomeMessage: data.welcomeMessage,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,
        callsPerUser: data.callsPerUser,
        agentId: data.agentId,
        voiceId: data.voiceId,
        voiceName: data.voiceName,
        voicePreviewUrl: data.voicePreviewUrl,
        organizationId: organization.id,
        totalCalls: receivableIds.length * data.callsPerUser,
        status: "DRAFT",
        audiences: {
          connect: audiences.map(a => ({ id: a.id }))
        },
        contacts: {
          connect: contactIds.map(id => ({ id }))
        },
        receivables: {
          connect: receivableIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: campaign };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: "Error al crear la campaña" };
  }
}
export async function updateCampaign(
  campaignId: string,
  input: Partial<z.infer<typeof campaignSchema>>
) {
  try {
    const session = await sessionServer();
    if (!session) return { success: false, error: "No autorizado" };

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    });

    if (!campaign) return { success: false, error: "Campaña no encontrada" };

    const validatedData = campaignSchema.partial().parse(input);
    
    // Actualizar la campaña con todos los datos validados
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        audiences: validatedData.audienceIds ? {
          set: validatedData.audienceIds.map(id => ({ id }))
        } : undefined
      }
    });

    // Actualizar receivables si se proporcionan
    if (input.receivableIds?.length) {
      await prisma.$transaction([
        prisma.receivable.updateMany({
          where: { campaignId },
          data: { campaignId: null }
        }),
        prisma.receivable.updateMany({
          where: { id: { in: input.receivableIds } },
          data: { campaignId }
        })
      ]);
    }

    revalidatePath("/dashboard/campaigns");
    return { success: true, data: updatedCampaign };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos", errors: error.errors };
    }
    return { success: false, error: "Error al actualizar la campaña" };
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    const session = await sessionServer();
    if (!session) {
      return {
        success: false,
        error: "No autorizado",
      };
    }

    // Verificar que la campaña existe y pertenece a la organización
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: "Campaña no encontrada",
      };
    }

    // No permitir eliminar campañas activas
    if (campaign.status === "ACTIVE") {
      return {
        success: false,
        error: "No se puede eliminar una campaña activa",
      };
    }

    // Desvincular receivables
    await prisma.receivable.updateMany({
      where: {
        campaignId: campaignId,
      },
      data: {
        campaignId: null,
      },
    });

    // Eliminar campaña
    await prisma.campaign.delete({
      where: {
        id: campaignId,
      },
    });

    revalidatePath("/dashboard/campaigns");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al eliminar la campaña",
    };
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED" | "CANCELLED"
) {
  try {
    const session = await sessionServer();
    if (!session) {
      return {
        success: false,
        error: "No autorizado",
      };
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: "Campaña no encontrada",
      };
    }

    // Validar transiciones de estado
    if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
      return {
        success: false,
        error: "No se puede modificar una campaña finalizada",
      };
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status,
      },
    });

    revalidatePath("/dashboard/campaigns");

    return {
      success: true,
      data: updatedCampaign,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al actualizar el estado de la campaña",
    };
  }
}

export async function getCampaigns() {
  const session = await sessionServer();
  if (!session) {
    return [];
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return campaigns;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return [];
  }
}

export async function getCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  return campaign;
}

export async function getCampaignWithCalls(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { calls: true },
  });
  return campaign;
}

export async function viewCampaignCalls(campaignId: string) {
  const session = await sessionServer();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const calls = await prisma.call.findMany({
      where: {
        campaignId
      },
      include: {
        receivable: {
          include: {
            contact: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: calls };
  } catch (error) {
    console.error('Error getting campaign calls:', error);
    return { success: false, error: "Error al obtener las llamadas" };
  }
}

export async function toggleCampaignStatus(campaignId: string) {
  const session = await sessionServer();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, error: "Campaña no encontrada" };
    }

    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { 
        status: newStatus,
        metadata: {
          ...(campaign.metadata && typeof campaign.metadata === "object" ? campaign.metadata : {}),
          lastStatusChange: new Date(),
          lastStatusChangeBy: session.user.id
        }
      }
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: updatedCampaign };
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    return { success: false, error: "Error al actualizar el estado" };
  }
}

export async function cancelCampaign(campaignId: string) {
  const session = await sessionServer();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, error: "Campaña no encontrada" };
    }

    if (campaign.status === "COMPLETED") {
      return { success: false, error: "No se puede cancelar una campaña completada" };
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { 
        status: "CANCELLED",
        endDate: new Date(),
        metadata: {
          ...(campaign.metadata && typeof campaign.metadata === "object" ? campaign.metadata : {}),
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          originalEndDate: campaign.endDate
        }
      }
    });

    // Cancelar todas las llamadas pendientes
    await prisma.call.updateMany({
      where: {
        campaignId,
        status: "SCHEDULED"
      },
      data: {
        status: "CANCELLED",
        metadata: {
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          reason: "Campaign cancelled"
        }
      }
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: updatedCampaign };
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return { success: false, error: "Error al cancelar la campaña" };
  }
}
