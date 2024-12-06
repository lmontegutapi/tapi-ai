import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ElevenLabsClient } from '@/clients/elevenlabs'
import { prisma } from '@/lib/db'
import twilio from 'twilio'

const openai = new OpenAI()

export const runtime = 'nodejs'

let conversationHistory: any[] = []

 export async function POST(req: Request) {
  const formData = await req.formData()
  const CallSid = formData.get('CallSid')
  const SpeechResult = formData.get('SpeechResult')

  const call = await prisma.call.findUnique({
    where: { id: CallSid as string },
    include: { debt: { include: { client: true } } }
  })

  if (!conversationHistory.length) {
    conversationHistory = [{
      role: "system",
      content: `Eres un asistente de cobranza empático y profesional. Tu objetivo es ayudar a resolver la situación de deuda manteniendo una comunicación respetuosa.

      Datos importantes:
      - Cliente: ${call?.debt.client.name}
      - Deuda: $${call?.debt.amountInCents ? call?.debt.amountInCents / 100 : 0}
      - Vencimiento: ${call?.debt.dueDate}
      - Estado: ${call?.debt.status}

      Directrices:
      - Usar lenguaje claro y sencillo
      - Mostrar empatía y comprensión
      - Ofrecer opciones de pago flexibles 
      - Evitar tono amenazante
      - Buscar soluciones factibles
      - Escuchar las circunstancias del cliente

      Objetivo: Lograr un acuerdo de pago favorable para ambas partes.`
    }]
  }

  conversationHistory.push({ role: "user", content: SpeechResult })

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: conversationHistory
  })

  const response = completion.choices[0].message.content
  conversationHistory.push({ role: "assistant", content: response })

  const audioResponse = await ElevenLabsClient.generateAudio({
    text: response,
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID!
  })

  const twiml = new twilio.twiml.VoiceResponse()
  twiml.play(audioResponse.url)
  
  twiml.gather({
    input: 'speech',
    language: 'es-MX',
    action: `${process.env.NEXT_PUBLIC_BASE_URL}/api/interactive-call`,
    method: 'POST'
  })

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  })
}