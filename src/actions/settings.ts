"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { session as serverSession } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";

const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  logo: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const teamMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["owner", "member", "viewer"])
})

const emailPreferenceSchema = z.object({
  emailType: z.enum(["WELCOME", "CAMPAIGN_CREATED", "CAMPAIGN_SUMMARY", "PAYMENT_PROMISE", "GOAL_REACHED", "INVITATION", "CUSTOM"]),
  isEnabled: z.boolean()
})

const settingsSchema = z.object({
  payments: z.object({
    CASH: z.boolean(),
    BANK_TRANSFER: z.boolean(),
    DIGITAL_WALLET: z.boolean(),
    CARD: z.boolean()
  }),
  communication: z.object({
    whatsapp: z.object({
      enabled: z.boolean()
    }),
    voiceAI: z.object({
      enabled: z.boolean()
    }),
    email: z.object({
      enabled: z.boolean()
    })
  })
});

export async function updateSettings(
  settings: z.infer<typeof settingsSchema>
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.session.userId,
            role: "owner"
          }
        }
      }
    });

    if (!organization) {
      return { success: false, error: "Organización no encontrada o sin permisos" }
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        settings: settings
      }
    });

    revalidatePath('/dashboard/settings');
    return { success: true, data: updatedOrg }

  } catch (error) {
    console.error('Error updating settings:', error)
    return {
      success: false,
      error: "Error al actualizar la configuración"
    }
  }
}

export async function getOrganizationSettings() {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.session.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Estructura por defecto para settings
    const defaultSettings = {
      payments: {
        CASH: false,
        BANK_TRANSFER: false,
        DIGITAL_WALLET: false,
        CARD: false
      },
      communication: {
        whatsapp: {
          enabled: false
        },
        voiceAI: {
          enabled: false
        },
        email: {
          enabled: false
        }
      }
    };

    return {
      success: true,
      data: {
        ...organization,
        settings: {
          ...defaultSettings,
          ...(organization?.settings as object || {})
        }
      }
    }

  } catch (error) {
    console.error('Error getting organization settings:', error)
    return {
      success: false,
      error: "Error al obtener la configuración"
    }
  }
}

// Actualizar configuración de la organización
export async function updateOrganizationSettings(
  data: z.infer<typeof organizationSchema>
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.session.userId,
            role: "owner"
          }
        }
      }
    })

    if (!organization) {
      return { success: false, error: "Organización no encontrada o sin permisos" }
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: data.name,
        metadata: data.metadata 
          ? data.metadata as Prisma.InputJsonValue
          : organization.metadata as Prisma.InputJsonValue,
        logo: data.logo || organization.logo
      }
    })

    revalidatePath('/dashboard/settings')
    return { success: true, data: updatedOrg }

  } catch (error) {
    console.error('Error updating organization:', error)
    return {
      success: false,
      error: "Error al actualizar la organización"
    }
  }
}

// Invitar miembro al equipo
export async function inviteTeamMember(
  data: z.infer<typeof teamMemberSchema>
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.session.userId,
            role: "owner"
          }
        }
      }
    })

    if (!organization) {
      return { success: false, error: "Organización no encontrada o sin permisos" }
    }

    // Crear invitación
    const invitation = await prisma.invitation.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: organization.id,
        email: data.email,
        role: data.role,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        inviterId: session.session.userId
      }
    })

    // Aquí iría el envío del email de invitación

    return { success: true, data: invitation }

  } catch (error) {
    console.error('Error inviting team member:', error)
    return {
      success: false,
      error: "Error al enviar la invitación"
    }
  }
}

// Remover miembro del equipo
export async function removeTeamMember(memberId: string) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.session.userId,
            role: "owner"
          }
        }
      }
    })

    if (!organization) {
      return { success: false, error: "Organización no encontrada o sin permisos" }
    }

    await prisma.member.delete({
      where: {
        id: memberId,
        organizationId: organization.id
      }
    })

    revalidatePath('/dashboard/settings')
    return { success: true }

  } catch (error) {
    console.error('Error removing team member:', error)
    return {
      success: false,
      error: "Error al remover al miembro"
    }
  }
}

// Actualizar preferencias de email
/* export async function updateEmailPreferences(
  preferences: z.infer<typeof emailPreferenceSchema>[]
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    // Actualizar en una transacción
    await prisma.$transaction(async (tx) => {
      for (const pref of preferences) {
        await tx.emailPreference.upsert({
          where: {
            userId_emailType: {
              userId: session.session.userId,
              emailType: pref.emailType
            }
          },
          create: {
            id: crypto.randomUUID(),
            userId: session.session.userId,
            emailType: pref.emailType,
            isEnabled: pref.isEnabled
          },
          update: {
            isEnabled: pref.isEnabled
          }
        })
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Error updating email preferences:', error)
    return {
      success: false,
      error: "Error al actualizar las preferencias"
    }
  }
}
 */
// Obtener templates de email
/* export async function getEmailTemplates() {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    const templates = await prisma.emailTemplate.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId: session.session.userId
            }
          }
        }
      }
    })

    return { success: true, data: templates }

  } catch (error) {
    console.error('Error getting email templates:', error)
    return {
      success: false,
      error: "Error al obtener las plantillas"
    }
  }
} */

// Obtener miembros del equipo
export async function getTeamMembers() {
  const session = await serverSession();
  if (!session) {
    return { success: false, error: "No autorizado" }
  }

  if (!session.session.activeOrganizationId) {
    return { success: false, error: "Organización no encontrada" }
  }

  const members = await prisma.member.findMany({
    where: {
      organizationId: session.session.activeOrganizationId
    },
    include: {
      user: true
    }
  })

  const membersExludedAdminPlatform = members.filter(member => member.user.role !== "admin")

  return { success: true, data: membersExludedAdminPlatform }
}