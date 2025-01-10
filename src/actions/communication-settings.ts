"use server";

import { prisma } from "@/lib/db";
import { session as serverSession } from "@/lib/auth-server";
import { z } from "zod";
import { getOrganizationSettings } from "./settings";
import { revalidatePath } from "next/cache";

const communicationSettingsSchema = z.object({
  whatsapp: z.object({
    enabled: z.boolean(),
    phoneNumber: z.string().optional(),
    businessProfile: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
    bot: z.object({
      enabled: z.boolean(),
      prompt: z.string().optional(),
    }).optional(),
  }),
  voiceAI: z.object({
    enabled: z.boolean(),
    voiceId: z.string().optional(),
    agentId: z.string().optional(),
  }),
});

export async function updateCommunicationSettings(settings: z.infer<typeof communicationSettingsSchema>) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const currentSettings = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
      select: { settings: true }
    });

    const existingSettings = currentSettings?.settings as Record<string, any> || {};

    const organization = await prisma.organization.update({
      where: { 
        id: session.session.activeOrganizationId 
      },
      data: {
        settings: {
          ...existingSettings,
          communication: settings
        }
      }
    });

    revalidatePath('/dashboard/settings');

    return { success: true, data: organization };
  } catch (error) {
    console.error("Error updating communication settings:", error);
    return { success: false, error: "Error al actualizar configuración" };
  }
}