'use server'

import { prisma } from '@/lib/db'
import { authClient } from '@/lib/auth-client'
import { revalidatePath } from 'next/cache'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

interface ParsedReceivable {
  identifier?: string
  amount: number
  dueDate: Date
  contactName: string
  contactPhone?: string
  contactEmail?: string
  metadata?: any
}

export async function uploadReceivables(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receivables/upload`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    console.log("result from action", result)

    const data = await auth.api.getSession({
      headers: headers()
    })

    console.log("data from action", data)

    if (!data?.session.activeOrganizationId) {
      return {
        success: false,
        error: "No se pudo obtener la organización activa"
      }
    }

    console.log("Pase por aqui")

    // Crear los receivables usando los datos procesados
    const createdReceivables = await createReceivables(
      data?.session.activeOrganizationId,
      result.data
    )

    console.log("createdReceivables", createdReceivables)

    revalidatePath('/dashboard/receivables')
    return createdReceivables

  } catch (error) {
    console.error('Error in receivables action:', error)
    return {
      success: false,
      error: 'Error al procesar las deudas'
    }
  }
}

export async function createReceivables(
  organizationId: string,
  receivables: ParsedReceivable[]
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const session = await authClient.getSession()
    if (!session) {
      return {
        success: false,
        error: 'No autorizado'
      }
    }

    console.log("receivables", receivables)

    // Crear los receivables en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const created = []

      for (const receivable of receivables) {
        // Buscar o crear el contacto
        let contact = await tx.contact.findFirst({
          where: {
            organizationId,
            OR: [
              { phone: receivable.contactPhone },
              { email: receivable.contactEmail }
            ]
          }
        })

        if (!contact) {
          contact = await tx.contact.create({
            data: {
              organizationId,
              name: receivable.contactName,
              phone: receivable.contactPhone,
              email: receivable.contactEmail,
            }
          })
        }

        // Crear el receivable
        const newReceivable = await tx.receivable.create({
          data: {
            organizationId,
            contactId: contact.id,
            paymentId: receivable.identifier || `PAY-${Date.now()}`,
            amount: receivable.amount,
            dueDate: receivable.dueDate,
            status: 'OPEN',
            isPastDue: new Date() > new Date(receivable.dueDate),
            isOpen: true,
            metadata: receivable.metadata
          }
        })

        created.push(newReceivable)
      }

      return created
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('Error creating receivables:', error)
    return {
      success: false,
      error: 'Error al crear las deudas'
    }
  }
}