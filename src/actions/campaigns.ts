"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { session as serverSession } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";
const contactRuleSchema = z.object({
  enabled: z.boolean(),
  daysFromDueDate: z.number(), // negativo para antes, positivo para después
  channel: z.enum(["WHATSAPP", "VOICE_AI"]),
});

const contactPreferencesSchema = z.object({
  rules: z.array(contactRuleSchema),
  defaultMessage: z.string().optional()
});

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
  audienceIds: z.array(z.string()).min(1, "Debes seleccionar al menos una audiencia"),
  contactPreferences: contactPreferencesSchema
});

// Tipo para TypeScript
type ContactRule = z.infer<typeof contactRuleSchema>;
type ContactPreferences = z.infer<typeof contactPreferencesSchema>;
type CampaignInput = z.infer<typeof campaignSchema>;



export async function createCampaign(data: z.infer<typeof campaignSchema>) {
  try {
    const session = await serverSession();
    if (!session) return { success: false, error: "No autorizado" };

    const organization = await prisma.organization.findFirst({
      where: {
        members: { some: { userId: session.user.id } }
      }
    });

    if (!organization) return { success: false, error: "Organización no encontrada" };

    // 1. Primero verificamos que las audiencias existan y pertenezcan a la organización
    const audiences = await prisma.audience.findMany({
      where: { 
        id: { in: data.audienceIds },
        organizationId: organization.id
      }
    });

    if (audiences.length !== data.audienceIds.length) {
      return { 
        success: false, 
        error: "Una o más audiencias no fueron encontradas" 
      };
    }

    // 2. Obtenemos los receivables elegibles
    const eligibleReceivables = await prisma.$queryRaw<Array<{ id: string, contactId: string }>>`
      SELECT DISTINCT r.id, r."contactId"
      FROM "receivable" r
      INNER JOIN "_audience_to_receivables" ar ON r.id = ar."B"
      LEFT JOIN "_campaign_to_receivables" cr ON r.id = cr."B"
      LEFT JOIN "campaign" c ON cr."A" = c.id
      WHERE ar."A" = ANY(${data.audienceIds}::text[])
      AND r."isOpen" = true
      AND (c.id IS NULL OR c.status = 'CANCELLED')
    `;

    if (eligibleReceivables.length === 0) {
      return { 
        success: false, 
        error: "Las audiencias seleccionadas no tienen deudas disponibles para campaña" 
      };
    }

    // 3. Creamos la campaña en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 Crear la campaña base
      const campaign = await tx.campaign.create({
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
          totalCalls: eligibleReceivables.length * data.callsPerUser,
          status: "DRAFT",
          contactPreferences: data.contactPreferences,
        }
      });

      // 3.2 Conectar las audiencias
      const audienceConnections = data.audienceIds.map(audienceId => 
        tx.$executeRaw`
          INSERT INTO "_audience_to_campaigns" ("A", "B")
          VALUES (${audienceId}, ${campaign.id})
        `
      );
      await Promise.all(audienceConnections);

      // 3.3 Conectar los receivables
      const receivableConnections = eligibleReceivables.map(receivable => 
        tx.$executeRaw`
          INSERT INTO "_campaign_to_receivables" ("A", "B")
          VALUES (${campaign.id}, ${receivable.id})
        `
      );
      await Promise.all(receivableConnections);

      // 3.4 Obtener los receivables de la campaña
      const campaignReceivables = await tx.receivable.findMany({
        where: {
          id: {
            in: eligibleReceivables.map(r => r.id)
          }
        },
        include: {
          contact: true
        }
      });

      // Retornamos un objeto con la campaña y sus receivables
      return {
        campaign,
        audiences,
        receivables: campaignReceivables
      };
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: result };
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
    const session = await serverSession();
    if (!session) return { success: false, error: "No autorizado" };

    // Verificamos la campaña y el acceso
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    });

    if (!campaign) return { success: false, error: "Campaña no encontrada" };

    // Verificamos el estado de la campaña
    if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
      return { success: false, error: "No se puede modificar una campaña finalizada" };
    }

    // Si hay nuevas audiencias, verificamos y obtenemos sus receivables
    let receivableIds: string[] = [];
    if (input.audienceIds?.length) {
      // Consulta raw para obtener receivables elegibles
      const eligibleReceivables = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT DISTINCT r.id
        FROM "receivable" r
        INNER JOIN "_audience_to_receivables" ar ON r.id = ar."B"
        LEFT JOIN "_campaign_to_receivables" cr ON r.id = cr."B"
        LEFT JOIN "campaign" c ON cr."A" = c.id
        WHERE ar."A" = ANY(${input.audienceIds}::text[])
        AND r."isOpen" = true
        AND (c.id IS NULL OR c.id = ${campaignId} OR c.status = 'CANCELLED')
      `;

      receivableIds = eligibleReceivables.map(r => r.id);

      if (receivableIds.length === 0) {
        return { 
          success: false, 
          error: "Las audiencias seleccionadas no tienen deudas disponibles" 
        };
      }
    }

    // Actualizamos la campaña
    const updatedCampaign = await prisma.$transaction(async (tx) => {
      // Actualizamos la campaña
      const updated = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.context && { context: input.context }),
          ...(input.objective && { objective: input.objective }),
          ...(input.welcomeMessage && { welcomeMessage: input.welcomeMessage }),
          ...(input.startDate && { startDate: new Date(input.startDate) }),
          ...(input.endDate && { endDate: new Date(input.endDate) }),
          ...(input.startTime && { startTime: input.startTime }),
          ...(input.endTime && { endTime: input.endTime }),
          ...(input.callsPerUser && { callsPerUser: input.callsPerUser }),
          ...(input.agentId && { agentId: input.agentId }),
          ...(input.voiceId && { voiceId: input.voiceId }),
          ...(input.voiceName && { voiceName: input.voiceName }),
          ...(input.voicePreviewUrl && { voicePreviewUrl: input.voicePreviewUrl }),
          ...(input.contactPreferences && { 
            contactPreferences: input.contactPreferences 
          }),
          // Actualización de audiencias usando operaciones raw
          ...(input.audienceIds && {
            audiences: {
              // Desconectar audiencias antiguas
              disconnect: campaign.audiences.map(a => ({ id: a.id })),
              // Conectar nuevas audiencias
              connect: input.audienceIds.map(id => ({ id }))
            }
          }),
          // Actualizar total de llamadas
          ...(receivableIds.length && {
            totalCalls: receivableIds.length * (input.callsPerUser || campaign.callsPerUser)
          })
        }
      });

      // Limpiar relaciones de receivables anteriores
      await tx.$executeRaw`
        DELETE FROM "_campaign_to_receivables" 
        WHERE "A" = ${campaignId}
      `;

      // Conectar nuevos receivables
      if (receivableIds.length) {
        for (const receivableId of receivableIds) {
          await tx.$executeRaw`
            INSERT INTO "_campaign_to_receivables" ("A", "B")
            VALUES (${campaignId}, ${receivableId})
          `;
        }
      }

      return updated;
    });

    revalidatePath("/dashboard/campaigns");
    return { success: true, data: updatedCampaign };
  } catch (error) {
    console.error('Error updating campaign:', error);
    
    // Manejo más detallado de errores
    if (error instanceof Error) {
      return { 
        success: false, 
        error: error.message || "Error al actualizar la campaña" 
      };
    }

    return { success: false, error: "Error desconocido al actualizar la campaña" };
  }
}

export async function getCampaign(campaignId: string) {
  try {
    const session = await serverSession();
    if (!session) return null;

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
      },
      include: {
        audiences: true,
        calls: {
          include: {
            receivable: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });

    return campaign;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export async function getCampaignWithCalls(campaignId: string) {
  try {
    const session = await serverSession();
    if (!session) return null;

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
      },
      include: {
        audiences: true,
        calls: {
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
        }
      }
    });

    return campaign;
  } catch (error) {
    console.error('Error fetching campaign with calls:', error);
    return null;
  }
}

export async function viewCampaignCalls(campaignId: string) {
  const session = await serverSession();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  try {
    // Primero verificamos acceso a la campaña
    const hasAccess = await prisma.campaign.findFirst({
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

    if (!hasAccess) {
      return { success: false, error: "No tienes acceso a esta campaña" };
    }

    const calls = await prisma.call.findMany({
      where: {
        campaignId
      },
      include: {
        receivable: {
          include: {
            contact: true
          }
        },
        promiseDetails: true // Incluimos los detalles de promesas de pago
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
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

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
      },
      include: {
        audiences: true,
        calls: {
          where: {
            status: 'SCHEDULED'
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, error: "Campaña no encontrada" };
    }

    if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
      return { success: false, error: "No se puede modificar una campaña finalizada" };
    }

    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

    const updatedCampaign = await prisma.$transaction(async (tx) => {
      // Actualizamos la campaña
      const updated = await tx.campaign.update({
        where: { id: campaignId },
        data: { 
          status: newStatus,
          metadata: {
            ...(campaign.metadata && typeof campaign.metadata === "object" ? campaign.metadata : {}),
            lastStatusChange: new Date(),
            lastStatusChangeBy: session.user.id,
            previousStatus: campaign.status
          }
        }
      });

      // Si se está pausando, actualizamos las llamadas programadas
      if (newStatus === "PAUSED" && campaign.calls.length > 0) {
        await tx.call.updateMany({
          where: {
            campaignId,
            status: "SCHEDULED"
          },
          data: {
            metadata: {
              pausedAt: new Date(),
              pausedBy: session.user.id
            }
          }
        });
      }

      return updated;
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: updatedCampaign };
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    return { success: false, error: "Error al actualizar el estado" };
  }
}

export async function cancelCampaign(campaignId: string) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

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

    // Usamos una transacción para asegurar que todo se actualiza o nada
    const result = await prisma.$transaction(async (tx) => {
      // Actualizamos la campaña
      const updatedCampaign = await tx.campaign.update({
        where: { id: campaignId },
        data: { 
          status: "CANCELLED",
          endDate: new Date(),
          metadata: {
            ...(campaign.metadata && typeof campaign.metadata === "object" ? campaign.metadata : {}),
            cancelledAt: new Date(),
            cancelledBy: session.user.id,
            originalEndDate: campaign.endDate,
            originalStatus: campaign.status
          }
        }
      });

      // Cancelamos todas las llamadas pendientes
      await tx.call.updateMany({
        where: {
          campaignId,
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"]
          }
        },
        data: {
          status: "CANCELLED",
          metadata: {
            cancelledAt: new Date(),
            cancelledBy: session.user.id,
            reason: "Campaign cancelled",
            originalStatus: "SCHEDULED"
          }
        }
      });

      return updatedCampaign;
    });

    revalidatePath('/dashboard/campaigns');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return { success: false, error: "Error al cancelar la campaña" };
  }
}

export async function getCampaigns() {
  try {
    const session = await serverSession();
    if (!session) return null;

    const campaigns = await prisma.campaign.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return null;
  }
}