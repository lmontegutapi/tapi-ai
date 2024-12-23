import { Client } from "@upstash/qstash"
import dotenv from 'dotenv';

dotenv.config();

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function publishCallJob(data: {
  receivableId: string
  campaignId: string
  phoneNumber: string
}) {
  try {
    // Publicar trabajo a nuestro endpoint de webhook
    const result = await qstashClient.publishJSON({
      url: `${process.env.SERVER_DOMAIN}/api/call/webhook`,
      body: data,
      // Configurar reintentos y retraso
      retries: 3,
      notBefore: 60 // Esperar 60 segundos antes de procesar
    })

    return {
      success: true,
      messageId: result.messageId
    }

  } catch (error) {
    console.error('Error publicando trabajo:', error)
    return {
      success: false,
      error: 'Error al encolar llamada'
    }
  }
}

// Publicar múltiples trabajos en batch
export async function publishBatchCalls(calls: Array<{
  receivableId: string
  campaignId: string
  phoneNumber: string
}>) {
  try {
    const messages = calls.map(call => ({
      url: `${process.env.SERVER_DOMAIN}/api/call/webhook`,
      body: call
    }))

    const results = await qstashClient.batchJSON(messages)

    return {
      success: true,
      messageIds: results.map(r => r.messageId)
    }

  } catch (error) {
    console.error('Error publicando batch:', error)
    return {
      success: false,
      error: 'Error al encolar llamadas'
    }
  }
}