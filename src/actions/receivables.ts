"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { session as serverSession } from "@/lib/auth-server";
import axios from "axios";

interface ParsedReceivable {
  identifier?: string;
  amountCents: number;
  dueDate: Date;
  contactName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  metadata?: any;
}

type ReceivableStatus = "OPEN" | "CLOSED" | "OVERDUE" | "PROMISED" | "PARTIALLY_PAID" | "BROKEN_PROMISE";

interface UpdateReceivableInput {
  amountCents: number;
  dueDate: Date;
  status: ReceivableStatus;
  contact: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
}

type ReceivableMetadata = {
  lastUpdatedAt: Date;
  lastUpdatedBy: string;
  lastStatus: ReceivableStatus;
  statusChangedAt: Date;
}

interface OrganizationSettings {
  payments?: Record<string, boolean>;
}

export async function uploadReceivables(formData: FormData) {
  try {
    const file = formData.get('file');
    const organizationId = formData.get('organizationId');

    if (!file || !organizationId) {
      throw new Error("Archivo y organización son requeridos");
    }

    const data = new FormData();
    data.append('file', file);
    data.append('organizationId', organizationId as string);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/receivables/upload`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data;

  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al procesar el archivo"
    };
  }
}

export async function createReceivables(
  receivables: ParsedReceivable[]
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await serverSession();
    if (!session) {
      return {
        success: false,
        error: "No autorizado",
      };
    }

    const organizationId = session.session.activeOrganizationId;

    // Crear los receivables en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const created = [];

      for (const receivable of receivables) {
        // Buscar o crear el contacto
        let contact = await tx.contact.findFirst({
          where: {
            organizationId: organizationId || "",
            OR: [
              { phone: receivable.contactPhone },
              { email: receivable.contactEmail },
            ],
          },
        });

        if (!contact) {
          contact = await tx.contact.create({
            data: {
              organizationId: organizationId || "",
              identifier: `CONT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: receivable.contactName,
              phone: receivable.contactPhone,
              email: receivable.contactEmail,
            },
          });
        }

        // Crear el receivable
        const newReceivable = await tx.receivable.create({
          data: {
            organizationId: organizationId || "",
            contactId: contact.id,
            identifier: receivable.identifier || `RCV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            paymentId: receivable.identifier || `PAY-${Date.now()}`,
            amountCents: receivable.amountCents,
            currency: "MXN",
            dueDate: receivable.dueDate,
            status: "OPEN",
            isPastDue: new Date() > new Date(receivable.dueDate),
            isOpen: true,
            metadata: receivable.metadata,
          },
        });

        created.push(newReceivable);
      }

      return created;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating receivables:", error);
    return {
      success: false,
      error: "Error al crear las deudas",
    };
  }
}

export async function getReceivables() {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No se pudo obtener la organización activa",
      };
    }

    const receivables = await prisma.receivable.findMany({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
      include: {
        contact: true,
        audiences: {
          include: {
            campaigns: true
          }
        },
        paymentPromises: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("Receivables111", receivables)

    return { success: true, data: receivables };
  } catch (error) {
    console.error("Error getting receivables:", error);
    return {
      success: false,
      error: "Error al obtener las deudas"
    };
  }
}

export async function updateReceivable(
  receivableId: string, 
  data: UpdateReceivableInput
) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { 
        success: false, 
        error: "No autorizado" 
      }
    }

    const validatedData = updateReceivableSchema.parse(data)

    const receivable = await prisma.receivable.findFirst({
      where: {
        id: receivableId,
        organizationId: session.session.activeOrganizationId
      },
      include: {
        contact: true
      }
    })

    if (!receivable) {
      return {
        success: false,
        error: "Deuda no encontrada"
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Actualizar contacto
      const updatedContact = await tx.contact.update({
        where: { id: receivable.contact.id },
        data: {
          name: validatedData.contact.name,
          phone: validatedData.contact.phone || null,
          email: validatedData.contact.email || null
        }
      })

      const isPastDue = validatedData.dueDate < new Date()
      const currentMetadata = receivable.metadata as unknown as ReceivableMetadata ?? {}

      const updatedReceivable = await tx.receivable.update({
        where: { id: receivableId },
        data: {
          amountCents: validatedData.amountCents,
          dueDate: validatedData.dueDate,
          status: validatedData.status,
          isPastDue,
          isOpen: validatedData.status === "OPEN" || validatedData.status === "PROMISED",
          metadata: {
            ...currentMetadata,
            lastUpdatedAt: new Date(),
            lastUpdatedBy: session.user.id,
            lastStatus: receivable.status,
            statusChangedAt: receivable.status !== validatedData.status ? new Date() : currentMetadata.statusChangedAt
          }
        },
        include: {
          contact: true,
          audiences: true
        }
      })

      return updatedReceivable
    })

    revalidatePath('/dashboard/receivables')
    return { success: true, data: result }

  } catch (error) {
    console.error('Error updating receivable:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        errors: error.errors
      }
    }

    return {
      success: false,
      error: "Error al actualizar la deuda"
    }
  }
}

export async function deleteReceivable(receivableId: string) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }

    const receivable = await prisma.receivable.findFirst({
      where: {
        id: receivableId,
        organizationId: session.session.activeOrganizationId
      }
    });

    if (!receivable) {
      return { success: false, error: "Deuda no encontrada" };
    }

    await prisma.receivable.delete({
      where: { id: receivableId }
    });

    revalidatePath("/dashboard/receivables");
    return { success: true };
  } catch (error) {
    console.error("Error deleting receivable:", error);
    return { success: false, error: "Error al eliminar la deuda" };
  }
}


export async function initiateCall(receivableId: string, campaignId?: string, isManual: boolean = false, phoneNumber?: string) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    // Validar que existe la URL de la API
    if (!process.env.API_URL) {
      throw new Error("API URL no configurada");
    }

    const receivable = await prisma.receivable.findUnique({
      where: { id: receivableId },
      include: { 
        contact: true,
        campaigns: true 
      },
    });

    if (!receivable) {
      return { success: false, error: "Deuda no encontrada" };
    }

    if (!receivable.contact.phone) {
      return { success: false, error: "El contacto no tiene número de teléfono" };
    }

    // Validar formato del teléfono
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(receivable.contact.phone)) {
      return { success: false, error: "Formato de teléfono inválido" };
    }

    // Crear registro de llamada
    const call = await prisma.call.create({
      data: {
        receivableId,
        campaignId,
        status: "SCHEDULED",
        duration: 0,
        metadata: {
          scheduledAt: new Date(),
          scheduledBy: session.user.id,
          isManual,
          source: isManual ? "MANUAL" : "CAMPAIGN"
        }
      },
    });

    try {
      // Iniciar llamada con Twilio
      const response = await axios.post(`${process.env.API_URL}/outbound-call`, {
        number: phoneNumber,
        voiceId: process.env.ELEVENLABS_VOICE_ID!,
        firstMessage: "Hola, ¿cómo estás?",
      });
      
      if (response.status !== 200) {
        throw new Error(response.data.error || 'Error al iniciar la llamada');
      }

      const result = response.data;

      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: "IN_PROGRESS",
          metadata: {
            ...((call.metadata && typeof call.metadata === "object") ? call.metadata : {}),
            twilioSid: result.callSid,
            channelId: result.channelId
          }
        }
      });

      revalidatePath("/dashboard/receivables");

      return {
        success: true,
        data: { call, twilioData: result }
      };
    } catch (fetchError) {
      // Si falla la llamada, actualizar el estado del registro
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: "FAILED",
          metadata: {
            ...((call.metadata && typeof call.metadata === "object") ? call.metadata : {}),
            error: (fetchError as Error).message,
            failedAt: new Date()
          }
        }
      });
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error iniciando llamada receivables:", error);
    return { 
      success: false, 
      error: error.message || "Error al iniciar la llamada"
    };
  }
}


export async function markAsOverdue(receivableId: string) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    const receivable = await prisma.receivable.update({
      where: { id: receivableId },
      data: {
        status: "OVERDUE",
        isPastDue: true,
        metadata: {
          markedOverdueAt: new Date(),
          markedOverdueBy: session.user.id,
        },
      },
    });

    revalidatePath("/dashboard/receivables");

    return {
      success: true,
      data: receivable,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al marcar como vencido",
    };
  }
}

export async function updateReceivableStatus(
  receivableId: string,
  status: "OPEN" | "CLOSED" | "OVERDUE"
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    const receivable = await prisma.receivable.update({
      where: { id: receivableId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/receivables");

    return {
      success: true,
      data: receivable,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al actualizar el estado",
    };
  }
}

const updateReceivableSchema = z.object({
  amountCents: z.coerce.number().positive("El monto debe ser positivo"),
  dueDate: z.coerce.date(),
  status: z.enum(["OPEN", "CLOSED", "OVERDUE", "PROMISED", "PARTIALLY_PAID", "BROKEN_PROMISE"]),
  contact: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres").nullable(),
    email: z.string().email("Email inválido").optional().nullable(),
  })
})


export async function getReceivablesByContact(contactId: string) {
  try {
    const receivables = await prisma.receivable.findMany({
      where: {
        contactId,
        isOpen: true
      },
      orderBy: {
        dueDate: 'asc'
      },
      include: {
        paymentPromises: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 
        },
        calls: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!receivables.length) {
      return {
        success: false,
        error: "No se encontraron deudas para este contacto"
      };
    }

    // Buscamos el contacto y la configuración de pagos en organization settings
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            settings: true
          }
        }
      }
    });

    if (!contact) {
      return {
        success: false,
        error: "Contacto no encontrado"
      };
    }

    // Obtener métodos de pago habilitados de los settings
    const enabledPaymentMethods = Object.entries((contact.organization?.settings as OrganizationSettings)?.payments || {})
      .filter(([_, enabled]) => enabled)
      .map(([method]) => method);

    return {
      success: true,
      data: {
        receivables,
        contact,
        paymentMethods: enabledPaymentMethods
      }
    };

  } catch (error) {
    console.error("Error obteniendo receivables del contacto:", error);
    return {
      success: false, 
      error: "Error al obtener las deudas del contacto"
    };
  }
}

export async function registerPayment(
  receivableId: string,
  data: z.infer<typeof paymentSchema>
) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    const validatedData = paymentSchema.parse(data);
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear el invoice directamente
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          receivableId,
          invoiceNumber: paymentId,
          amountCents: validatedData.amountCents,
          paymentMethod: validatedData.paymentMethod,
          emissionDate: new Date(),
          paymentDate: validatedData.paymentDate,
          status: "PAID",
          metadata: {
            notes: validatedData.notes,
            type: "MANUAL_PAYMENT"
          }
        }
      });

      const updatedReceivable = await tx.receivable.update({
        where: { id: receivableId },
        data: {
          status: "CLOSED",
          paymentId,
          isOpen: false,
          metadata: {
            paymentMethod: validatedData.paymentMethod,
            paymentDate: validatedData.paymentDate,
            notes: validatedData.notes,
            invoiceId: invoice.id
          }
        }
      });

      return {
        receivable: updatedReceivable,
        invoice
      };
    });

    revalidatePath("/dashboard/receivables");
    return { success: true, data: result };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos de pago inválidos",
        errors: error.errors
      };
    }

    console.error("Error registrando pago:", error);
    return {
      success: false,
      error: "Error al registrar el pago"
    };
  }
}

// Ajustar el schema de pago para los nuevos tipos
const paymentSchema = z.object({
  amountCents: z.number().positive(),
  paymentDate: z.date(),
  paymentMethod: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "DIGITAL_WALLET",
    "CARD"
  ]),
  notes: z.string().optional()
});