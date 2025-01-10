"use server";

import { prisma } from "@/lib/db";
import { session as serverSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

const PAYMENT_TYPES = ['CASH', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CARD'] as const;

export async function updatePaymentSettings(method: string, isActive: boolean) {
  try {
    // Validate the payment method
    if (!PAYMENT_TYPES.includes(method as any)) {
      return { success: false, error: "Método de pago inválido" };
    }

    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const currentSettings = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
      select: { settings: true }
    });

    // Extract existing settings or initialize as empty object
    const existingSettings = currentSettings?.settings as Record<string, any> || {};
    
    // Ensure payments object exists
    const paymentsSettings = existingSettings.payments || {};

    // Update the specific payment method
    paymentsSettings[method] = isActive;

    const organization = await prisma.organization.update({
      where: { 
        id: session.session.activeOrganizationId 
      },
      data: {
        settings: {
          ...existingSettings,
          payments: paymentsSettings
        }
      }
    });

    revalidatePath('/dashboard/settings');
    return { success: true, data: organization };
    
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return { success: false, error: "Error al actualizar configuración" };
  }
}

export async function getPaymentSettings() {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const currentSettings = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
      select: { settings: true }
    });

    const paymentsSettings = (currentSettings?.settings as Record<string, any>)?.payments || {};

    return { 
      success: true, 
      data: {
        paymentMethods: PAYMENT_TYPES.reduce((acc, method) => ({
          ...acc,
          [method]: !!paymentsSettings[method]
        }), {})
      }
    };
    
  } catch (error) {
    console.error("Error getting payment settings:", error);
    return { success: false, error: "Error al obtener configuración" };
  }
}