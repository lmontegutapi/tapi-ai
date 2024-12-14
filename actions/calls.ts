'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as Ably from 'ably'
import { session as serverSession } from '@/lib/auth-server'

const ably = new Ably.Realtime(process.env.ABLY_API_KEY!)

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

    // Crear registro de llamada
    const call = await prisma.call.create({
      data: {
        receivableId,
        status: "SCHEDULED",
        duration: 0,
        paymentPromise: false,
      }
    })

    // Iniciar la llamada
    const response = await fetch('/api/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: receivable.contact.phone,
        receivableId: receivable.id
      })
    })

    if (!response.ok) {
      throw new Error('Error al iniciar la llamada')
    }

    const { channelId } = await response.json()

    // Suscribirse al canal para monitorear la llamada
    const channel = ably.channels.get(channelId)
    
    // Monitorear eventos importantes
    channel.subscribe('end', async (message) => {
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: "COMPLETED",
          duration: message.data.duration,
          // Otros datos relevantes
        }
      })
      channel.detach()
    })

    return {
      success: true,
      data: {
        callId: call.id,
        channelId
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