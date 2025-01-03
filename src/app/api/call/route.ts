import { NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from '@/lib/db'
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { welcomeMessage: true }
    });

    const response = await axios.post(`${process.env.API_URL}/outbound-call`, {
      phoneNumber,
      voiceId: process.env.ELEVENLABS_VOICE_ID!,
      firstMessage: campaign?.welcomeMessage || "Hola, ¿cómo estás?",

    })

    const data = response.data

    return NextResponse.json({
      success: true,
      callSid: data.callSid
    })

  } catch (error) {
    console.error('Error iniciando llamada api/call:', error)
    return NextResponse.json(
      { error: 'Error iniciando llamada' },
      { status: 500 }
    )
  }
}