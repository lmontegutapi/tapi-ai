'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { session as serverSession } from '@/lib/auth-server'


export async function initiateCall(receivableId: string) {
  try {
    const session = await serverSession()
    if (!session) {
      return { success: false, error: "No autorizado" }
    }

    // Obtener el receivable con el contacto
    const receivable = await prisma.receivable.findUnique({
      where: { id: receivableId },
      include: { contact: true }
    })

    if (!receivable) {
      return { success: false, error: "Deuda no encontrada" }
    }

    return {
      success: true,
      data: {
        callId: "123",
        channelId: "123"
      }
    }

  } catch (error) {
    console.error('Error iniciando llamada actions/calls:', error)
    return {
      success: false,
      error: "Error al iniciar la llamada"
    }
  }
}