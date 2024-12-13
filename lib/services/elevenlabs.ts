import { ElevenLabsClient } from 'elevenlabs'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!
})

export async function generateVoiceMessage(params: {
  text: string
  voiceId: string
}) {
  try {
    const { text, voiceId } = params

    // Generar audio con ElevenLabs
    const audio = await elevenlabs.generate({
      text,
      voice: voiceId,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })

    return {
      success: true,
      audioBuffer: audio
    }

  } catch (error) {
    console.error('Error generando voz:', error)
    return {
      success: false,
      error: 'Error al generar audio'
    }
  }
}