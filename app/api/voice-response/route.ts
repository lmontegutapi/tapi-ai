import type { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse'
import OpenAI from 'openai'
import { ElevenLabsClient } from '@/clients/elevenlabs'
import { prisma } from '@/lib/db'

const openai = new OpenAI()

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const twiml = new VoiceResponse()
  const { CallSid, SpeechResult } = req.body
  
  const debtInfo = await prisma.call.findUnique({
    where: {
      id: CallSid
    }
  })
  
  if (!SpeechResult && !debtInfo) {
    return handleInitialGreeting(twiml, debtInfo)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `Eres un asistente de cobranza. Información del deudor:
          Saldo: ${debtInfo.balance}
          Fecha vencimiento: ${debtInfo.dueDate}
          Opciones de pago: ${debtInfo.paymentOptions}
          Estado: ${debtInfo.status}`
      },
      { role: "user", content: SpeechResult }
    ]
  })

  const response = completion.choices[0].message.content

  if (!response) {
    return twiml
  }

  const audioResponse = await ElevenLabsClient.generateAudio({
    text: response,
    voiceId: process.env.ELEVENLABS_VOICE_ID!
  })

  twiml.play(audioResponse.url)
  
  twiml.gather({
    //input: 'speech',
    language: 'es-MX',
    action: '/api/voice-response',
    method: 'POST'
  })

  res.setHeader('Content-Type', 'text/xml')
  res.status(200).send(twiml.toString())
}

function handleInitialGreeting(twiml: VoiceResponse, debtInfo: DebtInfo) {
  const gather = twiml.gather({
    //input: 'speech',
    language: 'es-MX',
    action: '/api/voice-response',
    method: 'POST'
  })

  gather.say({
    voice: 'Polly.Lupe',
    language: 'es-MX'
  }, `Hola ${debtInfo.name}, soy su asistente de cobranza. 
      ¿En qué puedo ayudarle? Puede consultar su saldo, 
      opciones de pago o hablar sobre su situación.`)

  return twiml
}