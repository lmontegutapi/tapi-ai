"use server";

import { auth } from "@/lib/auth";
import { session as sessionServer } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import type { Organization, Campaign } from "@prisma/client";

// Schema de validación
const campaignSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  context: z.string().min(10, "El contexto debe tener al menos 10 caracteres"),
  objective: z.string().min(10, "El objetivo debe tener al menos 10 caracteres"),
  welcomeMessage: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  callsPerUser: z.coerce.number().min(1).max(10),
  agentId: z.string().min(1, "Debes seleccionar un agente"),
  voiceType: z.enum(["NEUTRAL", "FRIENDLY", "PROFESSIONAL"]).default("NEUTRAL"),
  receivableIds: z.array(z.string()).min(1, "Debes seleccionar al menos una deuda")
});

type CampaignInput = z.infer<typeof campaignSchema>;

export async function createCampaign(data: z.infer<typeof campaignSchema>) {
  try {
    const session = await sessionServer()
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    // Obtener la organización activa
    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!organization) {
      return { success: false, error: "Organización no encontrada" }
    }

    // Verificar que el agente exista y pertenezca a la organización
    const agent = await prisma.agent.findFirst({
      where: {
        id: data.agentId,
        organizationId: organization.id
      }
    })

    if (!agent) {
      return { success: false, error: "Agente no encontrado" }
    }

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: organization.id,
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
        totalCalls: data.receivableIds.length * data.callsPerUser,
        status: "DRAFT",
        voiceType: data.voiceType ?? "NEUTRAL",
        receivables: {
          connect: data.receivableIds.map(id => ({ id }))
        }
      }
    })

    revalidatePath('/dashboard/campaigns')

    return {
      success: true,
      data: campaign
    }

  } catch (error) {
    console.error('Error creating campaign:', error)
    return {
      success: false,
      error: "Error al crear la campaña"
    }
  }
}
export async function updateCampaign(
  campaignId: string,
  input: Partial<CampaignInput>
) {
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

    // Validar input parcial
    const validatedData = campaignSchema.partial().parse(input);

    // Actualizar campaña
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: validatedData,
    });

    // Si se actualizaron los receivables, actualizarlos
    if (input.receivableIds) {
      // Primero desvinculamos los existentes
      await prisma.receivable.updateMany({
        where: {
          campaignId: campaignId,
        },
        data: {
          campaignId: null,
        },
      });

      // Luego vinculamos los nuevos
      await prisma.receivable.updateMany({
        where: {
          id: {
            in: input.receivableIds,
          },
        },
        data: {
          campaignId: campaignId,
        },
      });
    }

    revalidatePath("/dashboard/campaigns");

    return {
      success: true,
      data: updatedCampaign,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        errors: error.errors,
      };
    }

    return {
      success: false,
      error: "Error al actualizar la campaña",
    };
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
