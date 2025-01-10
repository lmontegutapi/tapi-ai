"use server";

import { prisma } from "@/lib/db";
import { ContactChannel, DelinquencyBucket, ReceivableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getDelinquencyBucket } from "@/lib/audience-utils";
import { session as serverSession } from "@/lib/auth-server";

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
        name: data.name,
        description: data.description,
        delinquencyBucket: data.delinquencyBucket,
        contactPreference: data.contactPreference,
        organizationId: data.organizationId,
      }
    });

    revalidatePath("/dashboard/audiences");
    return { success: true, data: audience };
  } catch (error) {
    console.error("Error creating audience:", error);
    return { success: false, error: "Error al crear audiencia" };
  }
}

export async function getAudiences() {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const audiences = await prisma.audience.findMany({
      where: {
        organizationId: session.session.activeOrganizationId
      },
      include: {
        receivables: {
          include: {
            contact: true
          }
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular métricas para cada audiencia
    const audiencesWithMetrics = audiences.map(audience => {
      const totalAmount = audience.receivables.reduce((sum, r) => sum + r.amountCents, 0);
      const uniqueContacts = new Set(audience.receivables.map(r => r.contact.id)).size;
      const activeCampaigns = audience.campaigns.filter(c => c.status === "ACTIVE").length;
      const pastDueAmount = audience.receivables
        .filter(r => new Date(r.dueDate) < new Date())
        .reduce((sum, r) => sum + r.amountCents, 0);

      return {
        ...audience,
        metrics: {
          totalAmount,
          totalReceivables: audience.receivables.length,
          totalContacts: uniqueContacts,
          activeCampaigns,
          pastDueAmount,
          averageAmount: audience.receivables.length > 0 
            ? Math.round(totalAmount / audience.receivables.length) 
            : 0
        }
      };
    });

    return { success: true, data: audiencesWithMetrics };
  } catch (error) {
    console.error('Error getting audiences:', error);
    return { success: false, error: "Error al obtener audiencias" };
  }
}

export async function updateAudience(
  id: string,
  data: {
    name: string;
    description?: string;
    delinquencyBucket: DelinquencyBucket;
    contactPreference: ContactChannel;
    metadata?: any;
  }
) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const audience = await prisma.audience.findFirst({
      where: {
        id,
        organizationId: session.session.activeOrganizationId
      },
      include: {
        campaigns: true
      }
    });

    if (!audience) {
      return { success: false, error: "Audiencia no encontrada" };
    }

    // Verificar si hay campañas activas
    const hasActiveCampaigns = audience.campaigns.some(c => c.status === "ACTIVE");
    if (hasActiveCampaigns) {
      return { 
        success: false, 
        error: "No se puede modificar una audiencia con campañas activas" 
      };
    }

    const updatedAudience = await prisma.audience.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        delinquencyBucket: data.delinquencyBucket,
        contactPreference: data.contactPreference,
        metadata: {
          ...((audience.metadata || {}) as Record<string, any>),
          ...((data.metadata || {}) as Record<string, any>),
          lastUpdated: new Date().toISOString(),
          updatedBy: session.user.id
        }
      },
      include: {
        receivables: {
          include: {
            contact: true
          }
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    revalidatePath('/dashboard/audiences');
    return { success: true, data: updatedAudience };
  } catch (error) {
    console.error('Error updating audience:', error);
    return { success: false, error: "Error al actualizar audiencia" };
  }
}

export async function deleteAudience(id: string) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const audience = await prisma.audience.findFirst({
      where: {
        id,
        organizationId: session.session.activeOrganizationId
      },
      include: {
        campaigns: true
      }
    });

    if (!audience) {
      return { success: false, error: "Audiencia no encontrada" };
    }

    // Verificar si hay campañas asociadas
    if (audience.campaigns.length > 0) {
      return { 
        success: false, 
        error: "No se puede eliminar una audiencia con campañas asociadas" 
      };
    }

    // Usar transacción para asegurar la integridad
    await prisma.$transaction(async (tx) => {
      // Primero desvinculamos los receivables
      await tx.audience.update({
        where: { id },
        data: {
          receivables: {
            set: [] // Desconectar todas las relaciones
          }
        }
      });

      // Luego eliminamos la audiencia
      await tx.audience.delete({
        where: { id }
      });
    });

    revalidatePath('/dashboard/audiences');
    return { success: true };
  } catch (error) {
    console.error('Error deleting audience:', error);
    return { success: false, error: "Error al eliminar audiencia" };
  }
}

export async function getAudienceDetails(audienceId: string) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const audience = await prisma.audience.findFirst({
      where: { 
        id: audienceId,
        organizationId: session.session.activeOrganizationId
      },
      include: {
        receivables: {
          include: {
            contact: true,
            paymentPromises: {
              where: {
                status: {
                  in: ['PENDING', 'PARTIALLY_FULFILLED']
                }
              }
            }
          }
        },
        campaigns: {
          include: {
            calls: true
          }
        }
      }
    });

    if (!audience) {
      return { success: false, error: "Audiencia no encontrada" };
    }

    // Calcular métricas detalladas
    const totalAmount = audience.receivables.reduce((sum, r) => sum + r.amountCents, 0);
    const pastDueAmount = audience.receivables
      .filter(r => new Date(r.dueDate) < new Date())
      .reduce((sum, r) => sum + r.amountCents, 0);
    const uniqueContacts = new Set(audience.receivables.map(r => r.contact.id));
    const activePromises = audience.receivables.reduce((sum, r) => 
      sum + r.paymentPromises.length, 0);
    const totalCalls = audience.campaigns.reduce((sum, c) => 
      sum + c.calls.length, 0);

    // Agrupar por estado de deuda
    const receivablesByStatus = audience.receivables.reduce((acc, r) => ({
      ...acc,
      [r.status]: (acc[r.status] || 0) + 1
    }), {} as Record<ReceivableStatus, number>);

    return {
      success: true,
      data: {
        audience,
        metrics: {
          totalAmount,
          pastDueAmount,
          totalReceivables: audience.receivables.length,
          totalContacts: uniqueContacts.size,
          totalCampaigns: audience.campaigns.length,
          activeCampaigns: audience.campaigns.filter(c => c.status === "ACTIVE").length,
          activePromises,
          totalCalls,
          averageAmount: audience.receivables.length > 0 
            ? Math.round(totalAmount / audience.receivables.length) 
            : 0,
          receivablesByStatus,
          contactChannelMetrics: {
            whatsapp: audience.receivables.filter(r => r.contact.phone).length,
            email: audience.receivables.filter(r => r.contact.email).length,
            voice: audience.receivables.filter(r => r.contact.phone).length
          }
        }
      }
    };
  } catch (error) {
    console.error('Error getting audience details:', error);
    return { success: false, error: "Error al obtener detalles de la audiencia" };
  }
}


export async function syncAudienceMembers(audienceId: string) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const audience = await prisma.audience.findFirst({
      where: {
        id: audienceId,
        organizationId: session.session.activeOrganizationId
      }
    });

    if (!audience) {
      return { success: false, error: "Audiencia no encontrada" };
    }

    // Fecha actual
    const now = new Date();
    
    // Calcular fechas límite para cada bucket
    const dates = {
      over90: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)),
      days90: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)),
      days60: new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)),
      days30: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)),
      days15: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)),
      days10: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000))
    };

    // Buscar receivables que coincidan con el bucket
    const receivables = await prisma.receivable.findMany({
      where: {
        organizationId: audience.organizationId,
        isOpen: true,
        // Definir condiciones según el bucket
        ...(() => {
          switch (audience.delinquencyBucket) {
            case 'PAST_DUE_OVER_90':
              return {
                dueDate: {
                  lt: dates.over90 // Fecha de vencimiento anterior a 90 días
                }
              };
            case 'PAST_DUE_90':
              return {
                dueDate: {
                  lt: dates.days90,
                  gte: dates.over90
                }
              };
            case 'PAST_DUE_60':
              return {
                dueDate: {
                  lt: dates.days60,
                  gte: dates.days90
                }
              };
            case 'PAST_DUE_30':
              return {
                dueDate: {
                  lt: dates.days30,
                  gte: dates.days60
                }
              };
            case 'PAST_DUE_15':
              return {
                dueDate: {
                  lt: dates.days15,
                  gte: dates.days30
                }
              };
            case 'PAST_DUE_10':
              return {
                dueDate: {
                  lt: dates.days10,
                  gte: dates.days15
                }
              };
            case 'CURRENT':
              return {
                dueDate: {
                  gte: now // Fecha de vencimiento futura
                }
              };
            default:
              return {};
          }
        })()
      },
      include: {
        contact: true
      }
    });

    // Log para debug
    console.log(`Found ${receivables.length} receivables for bucket ${audience.delinquencyBucket}`);
    console.log('Date conditions:', {
      now: now.toISOString(),
      over90: dates.over90.toISOString()
    });
    
    if (receivables.length === 0) {
      return {
        success: false,
        error: `No se encontraron deudas para el bucket: ${audience.delinquencyBucket}`,
        details: {
          bucket: audience.delinquencyBucket,
          organizationId: audience.organizationId,
          dateConditions: {
            now: now.toISOString(),
            over90: dates.over90.toISOString()
          }
        }
      };
    }

    // Resto del código igual...
    // Actualizar relaciones y calcular métricas
    const receivableIds = receivables.map(r => r.id);

    await prisma.$transaction(async (tx) => {
      await tx.audience.update({
        where: { id: audienceId },
        data: {
          receivables: {
            set: receivableIds.map(id => ({ id }))
          }
        }
      });
    });

    // Calcular métricas
    const uniqueContacts = new Set(receivables.map(r => r.contact.id));
    const totalAmount = receivables.reduce((sum, r) => sum + r.amountCents, 0);

    return {
      success: true,
      data: {
        receivablesCount: receivableIds.length,
        contactsCount: uniqueContacts.size,
        totalAmount,
        bucket: audience.delinquencyBucket
      }
    };

  } catch (error) {
    console.error('Error syncing audience:', error);
    return { 
      success: false, 
      error: "Error al sincronizar audiencia",
      details: error instanceof Error ? error.message : undefined
    };
  }
}