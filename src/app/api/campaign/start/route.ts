import { NextResponse } from 'next/server'
import { publishCallJob } from '@/lib/services/qstash'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json()

    // Obtener campaña y receivables
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        receivables: {
          include: { contact: true }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Preparar llamadas para el batch
    const calls = campaign.receivables.map(receivable => ({
      receivableId: receivable.id,
      campaignId: campaign.id,
      phoneNumber: receivable.contact.phone!
    }))

    // Publicar llamadas a QStash
    const results = await Promise.all(calls.map(call => publishCallJob(call)))

    if (!results.every(result => result.success)) {
      throw new Error('Error al publicar llamadas')
    }

    // Actualizar estado de la campaña
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        totalCalls: calls.length
      }
    })

    return NextResponse.json({
      success: true,
      messageIds: results.map(result => result.messageId),
      queuedCalls: calls.length
    })

  } catch (error) {
    console.error('Error iniciando campaña:', error)
    return NextResponse.json(
      { error: 'Error al iniciar campaña' },
      { status: 500 }
    )
  }
}