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
    // Verificar el token de autorización
    /* const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    } */

    // Extraer el token
    /* const token = authHeader.split(' ')[1]; */
    
    // Validar el token con BetterAuth
    /* const session = await serverSession();
    if (!session || session.session.token !== token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    } */

    const { phoneNumber, receivableId, callId, isManual, campaignId } = await req.json()

    // Validar datos requeridos
    if (!phoneNumber || !receivableId || !callId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Crear un canal único para esta llamada
    const channelId = `call-${callId}-${Date.now()}`
    const channel = ably.channels.get(channelId)

    const baseUrl = process.env.API_URL || req.headers.get('origin')
    if (!baseUrl) {
      throw new Error('Base URL not configured')
    }

    // Iniciar la llamada con Twilio
    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      twiml: `
        <Response>
          <Connect>
            <Stream url="wss://${baseUrl}/api/call/stream?channelId=${channelId}" />
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
    console.error('Error iniciando llamada api/call:', error)
    return NextResponse.json(
      { error: 'Error iniciando llamada' },
      { status: 500 }
    )
  }
}