// app/api/call/webhook/route.ts
import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { generateVoiceMessage } from '@/lib/services/elevenlabs'
import { prisma } from '@/lib/db'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

async function handler(req: Request) {
  try {
    const body = await req.json()
    const { receivableId, campaignId, phoneNumber } = body

    // Obtener datos necesarios
    const [receivable, campaign] = await Promise.all([
      prisma.receivable.findUnique({
        where: { id: receivableId },
        include: { contact: true }
      }),
      prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { agent: true }
      })
    ])

    if (!receivable || !campaign) {
      throw new Error('Datos no encontrados')
    }

    // Generar mensaje personalizado
    const message = `
      Hola ${receivable.contact.name},
      Le llamo de ${campaign.context}.
      Nos comunicamos por una deuda pendiente de $${receivable.amountCents / 100}
      con vencimiento el ${receivable.dueDate.toLocaleDateString()}.
      ${campaign.welcomeMessage}
    `.trim()

    // Generar audio
    const audio = await generateVoiceMessage({
      text: message,
      voiceId: campaign.agent?.elevenlabsId || ''
    })

    if (!audio.success) {
      throw new Error('Error generando audio')
    }

    // Iniciar llamada con Twilio
    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      twiml: `
        <Response>
          <Play>${audio.audioBuffer?.toString() || ''}</Play>
        </Response>
      `
    })

    // Registrar llamada
    await prisma.call.create({
      data: {
        campaignId,
        receivableId,
        status: 'IN_PROGRESS',
        metadata: {
          twilioSid: call.sid,
          message
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}

// Verificar firma de QStash
export const POST = verifySignatureAppRouter(handler)