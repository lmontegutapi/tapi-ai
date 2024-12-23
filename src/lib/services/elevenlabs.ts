import { ElevenLabsClient } from 'elevenlabs'
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!
});

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

export async function previewVoice(voiceId: string, text: string = "Hola, soy tu agente de cobranza. ¿Cómo puedo ayudarte hoy?") {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    return `data:audio/mpeg;base64,${Buffer.from(response.data).toString('base64')}`;
  } catch (error) {
    console.error('Error previewing voice:', error);
    throw error;
  }
}

export type ElevenLabsAgent = {
  id: string;
  name: string;
  voice_id: string;
  description: string;
  voiceGender: string;
  voiceAge: string;
  voiceStyle: string;
  voicePitch: string;
  voiceSpeed: string;
  voiceStability: string;
  voiceSimilarity: string;
  default_config: {
    prompt_template: string;
    temperature: number;
    max_tokens: number;
      voice_settings: {
      gender: string;
      age: string;
      style: string;
      pitch: number;
      speed: number;
      stability: number;
      similarity_boost: number;
      use_case: string;
    }
  }
}

export const PREDEFINED_AGENTS: ElevenLabsAgent[] = [
  {
    id: "collections-pro",
    name: "Agente de Cobranza Profesional",
    voice_id: "ErXwobaYiN019PkySvjV",
    description: "Especializado en cobranzas con enfoque profesional y directo",
    voiceGender: "male",
    voiceAge: "adult",
    voiceStyle: "neutral",
    voicePitch: "0.5",
    voiceSpeed: "0.5",
    voiceStability: "0.75",
    voiceSimilarity: "0.75",
    default_config: {
      prompt_template: "Eres un agente de cobranza profesional...",
      temperature: 0.7,
      max_tokens: 150,
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.5,
        use_case: "COLLECTIONS"
      }
    }
  },
  {
    id: "customer-service",
    name: "Agente de Atención al Cliente",
    voice_id: "EXAVITQu4vr4xnSDxMaL",
    description: "Especializado en atención al cliente con tono amigable",
    voiceGender: "female",
    voiceAge: "adult",
    voiceStyle: "neutral",
    voicePitch: "0.5",
    voiceSpeed: "0.5",
    voiceStability: "0.75",
    voiceSimilarity: "0.75",
    default_config: {
      prompt_template: "Eres un agente de atención al cliente...",
      temperature: 0.8,
      max_tokens: 150,
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.7,
        style: 0.3,
        use_case: "CUSTOMER_SERVICE"
      }
    }
  }
];

export async function getAvailableAgents(): Promise<ElevenLabsAgent[]> {
  return PREDEFINED_AGENTS;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  }
}

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices?.filter((voice: ElevenLabsVoice) => 
      voice.labels?.accent?.toLowerCase().includes('spanish') || 
      voice.labels?.accent?.toLowerCase().includes('español')
    );
  } catch (error) {
    console.error('Error getting voices:', error);
    return PREDEFINED_AGENTS.map(agent => ({
      voice_id: agent.voice_id,
      name: agent.name,
      preview_url: `https://api.elevenlabs.io/v1/voices/${agent.voice_id}/preview`,
      labels: {
        description: agent.description,
        use_case: agent.default_config.voice_settings.use_case
      }
    }));
  }
}