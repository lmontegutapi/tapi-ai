"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { session as serverSession } from "@/lib/auth-server";

const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  logo: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const teamMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"])
})

const emailPreferenceSchema = z.object({
  emailType: z.enum(["WELCOME", "CAMPAIGN_CREATED", "CAMPAIGN_SUMMARY", "PAYMENT_PROMISE", "GOAL_REACHED", "INVITATION", "CUSTOM"]),
  isEnabled: z.boolean()
})

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
    })

    return {
      success: true,
      data: organization
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
            role: "ADMIN"
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
          ? JSON.stringify(data.metadata)
          : organization.metadata,
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
            role: "ADMIN"
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
            role: "ADMIN"
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
export async function getEmailTemplates() {
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
}

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

  return { success: true, data: members }
}
