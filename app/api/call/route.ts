import { NextResponse } from 'next/server'
import twilio from 'twilio'
import Ably from 'ably'
import { session as serverSession } from '@/lib/auth-server'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const ably = new Ably.Realtime(process.env.ABLY_API_KEY!)

export async function POST(req: Request) {
  try {
    const session = await serverSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { phoneNumber, receivableId } = await req.json()

    // Crear un canal único para esta llamada
    const channelId = `call-${receivableId}-${Date.now()}`
    const channel = ably.channels.get(channelId)

    // Iniciar la llamada con Twilio
    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      twiml: `
        <Response>
          <Connect>
            <Stream url="wss://${req.headers.get('host')}/api/call/stream?channelId=${channelId}" />
          </Connect>
        </Response>
      `
    })

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      channelId
    })

  } catch (error) {
    console.error('Error iniciando llamada:', error)
    return NextResponse.json(
      { error: 'Error iniciando llamada' },
      { status: 500 }
    )
  }
}