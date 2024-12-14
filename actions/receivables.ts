"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { session as serverSession } from "@/lib/auth-server";

interface ParsedReceivable {
  identifier?: string;
  amountCents: number;
  dueDate: Date;
  contactName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  metadata?: any;
}

export async function uploadReceivables(formData: FormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/receivables/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();


    const data = await auth.api.getSession({
      headers: headers(),
    });



    if (!data?.session.activeOrganizationId) {
      return {
        success: false,
        error: "No se pudo obtener la organización activa",
      };
    }



    // Crear los receivables usando los datos procesados
    const createdReceivables = await createReceivables(
      result.data
    );


    revalidatePath("/dashboard/receivables");
    return createdReceivables;
  } catch (error) {
    console.error("Error in receivables action:", error);
    return {
      success: false,
      error: "Error al procesar las deudas",
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
  const data = await auth.api.getSession({
    headers: headers(),
  });

  if (!data?.session.activeOrganizationId) {
    return {
      success: false,
      error: "No se pudo obtener la organización activa",
    };
  }

  const receivables = await prisma.receivable.findMany({
    where: {
      organizationId: data.session.activeOrganizationId,
    },
    include: {
      contact: true,
    },
  });

  return receivables;
}

const paymentSchema = z.object({
  amountCents: z.number().positive(),
  paymentDate: z.date(),
  paymentMethod: z.enum([
    "CASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "BANK_TRANSFER",
    "MERCADO_PAGO",
    "UALA",
    "MODO",
    "PERSONAL_PAY",
    "OTHER",
  ]),
  notes: z.string().optional(),
});

export async function initiateCall(receivableId: string, campaignId?: string) {
  try {
    const session = await serverSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    // Obtener el receivable con el contacto
    const receivable = await prisma.receivable.findUnique({
      where: { id: receivableId },
      include: { contact: true },
    });

    if (!receivable) {
      return { success: false, error: "Deuda no encontrada" };
    }

    // Crear registro de llamada
    const call = await prisma.call.create({
      data: {
        receivableId,
        campaignId, // Opcional
        status: "SCHEDULED",
        duration: 0
      },
    });

    // Aquí iría la integración con ElevenLabs y Twilio
    // Por ahora solo simulamos la llamada

    revalidatePath("/dashboard/receivables");

    return {
      success: true,
      data: call,
    };
  } catch (error) {
    console.error("Error iniciando llamada:", error);
    return {
      success: false,
      error: "Error al iniciar la llamada",
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

    // Validar datos
    const validatedData = paymentSchema.parse(data);

    // Generar paymentId único
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Actualizar en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la transacción de pago
      const paymentTransaction = await tx.paymentTransaction.create({
        data: {
          paymentLinkId: paymentId, // Usamos el paymentId como linkId
          amountCents: validatedData.amountCents,
          status: "COMPLETED",
          paymentMethod: validatedData.paymentMethod,
          paymentReference: paymentId,
          metadata: {
            notes: validatedData.notes,
            receivableId,
            type: "MANUAL_PAYMENT",
          },
        },
      });

      // Actualizar receivable
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
            paymentTransactionId: paymentTransaction.id,
          },
        },
      });

      return {
        receivable: updatedReceivable,
        transaction: paymentTransaction,
      };
    });

    revalidatePath("/dashboard/receivables");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos de pago inválidos",
        errors: error.errors,
      };
    }

    console.error("Error registrando pago:", error);
    return {
      success: false,
      error: "Error al registrar el pago",
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
  status: z.enum(["OPEN", "CLOSED", "OVERDUE", "PENDING_DUE"]),
  contact: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres").nullable(),
    email: z.string().email("Email inválido").optional().nullable(),
  })
})

interface ReceivableMetadata {
  lastUpdatedAt?: Date
  lastUpdatedBy?: string
  lastStatus?: string
  statusChangedAt?: Date
  notes?: string
  paymentAttempts?: number
  callAttempts?: number
  [key: string]: any // Para metadata adicional flexible
}

type UpdateReceivableInput = z.infer<typeof updateReceivableSchema>;

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

    // Verificar que el receivable existe y pertenece a la organización del usuario
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

    // Actualizar en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar información del contacto
      const updatedContact = await tx.contact.update({
        where: { id: receivable.contact.id },
        data: {
          name: validatedData.contact.name,
          phone: validatedData.contact.phone || null,
          email: validatedData.contact.email || null
        }
      })

      // Calcular si está vencida basado en la fecha
      const isPastDue = validatedData.dueDate < new Date()

      // Actualizar el receivable
      const currentMetadata = receivable.metadata as ReceivableMetadata || {}

      const updatedReceivable = await tx.receivable.update({
        where: { id: receivableId },
        data: {
          amountCents: validatedData.amountCents,
          dueDate: validatedData.dueDate,
          status: validatedData.status,
          isPastDue,
          isOpen: validatedData.status === "OPEN" || validatedData.status === "PENDING_DUE",
          metadata: {
            ...currentMetadata,
            lastUpdatedAt: new Date(),
            lastUpdatedBy: session.user.id,
            lastStatus: receivable.status,
            statusChangedAt: receivable.status !== validatedData.status ? new Date() : currentMetadata.statusChangedAt
          }
        },
        include: {
          contact: true
        }
      })

      return updatedReceivable
    })

    revalidatePath('/dashboard/receivables')

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('Error actualizando receivable:', error)
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