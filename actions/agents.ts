'use server'

import axios from 'axios'
import { prisma } from '@/lib/db'
import { session as serverSession } from '@/lib/auth-server'
import { Agent, Prisma } from '@prisma/client'

type CreateAgentInput = {
  name: string;
  description: string;
  elevenlabsId: string;
  voiceType: "male" | "female";
}

type UpdateAgentInput = {
  name?: string;
  description?: string;
  elevenlabsId?: string;
  voiceType?: "male" | "female";
}

export async function getAgents() {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }
  
  const organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    }
  })

  return await prisma.agent?.findMany({
    where: {
      organizationId: organization?.id,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  })

}

export async function createAgent(data: CreateAgentInput) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  const organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    }
  })

  if (!organization) {
    throw new Error("No se encontró la organización")
  }

  const newAgent = await prisma.agent.create({
    data: {
      ...data,
      organizationId: organization.id,
      isActive: true,
      metadata: Prisma.JsonNull
    }
  })

  return newAgent
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  return await prisma.agent.update({
    where: { id },
    data: {
      ...data,
      metadata: Prisma.JsonNull
    }
  });
}

export async function deleteAgent(agentId: string) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  const deletedAgent = await prisma.agent.delete({
    where: { id: agentId }
  })

  return deletedAgent
}

/* fetch('https://api.elevenlabs.io/v1/convai/agents', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err)); */
export async function getElevenLabsAgents() {
  try { 
    const response = await axios.get('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
    }
  })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// 422 Unprocessable Entity
/* {
  "detail": [
    {
      "loc": [
        "<string>"
      ],
      "msg": "<string>",
      "type": "<string>"
    }
  ]
} */

  // 200 OK

/*   {
    "agent_id": "<string>",
    "name": "<string>",
    "conversation_config": {
      "agent": {
        "server": {
          "url": "<string>",
          "server_events": [
            "turn"
          ],
          "secret": "<string>",
          "timeout": 5,
          "num_retries": 2,
          "error_message": "I encountered an internal error occurred while handling your request and I am not able to respond at the moment."
        },
        "prompt": {
          "prompt": "<string>",
          "llm": "gpt-4o-mini",
          "temperature": 0,
          "max_tokens": -1,
          "tools": [
            {
              "type": "webhook",
              "name": "<string>",
              "description": "<string>",
              "placeholder_statement": "<string>",
              "api_schema": {
                "url": "<string>",
                "method": "GET",
                "path_params_schema": {},
                "query_params_schema": {
                  "properties": {},
                  "required": [
                    "<string>"
                  ]
                },
                "request_body_schema": {
                  "type": "object",
                  "properties": {},
                  "required": [
                    "<string>"
                  ],
                  "description": ""
                },
                "request_headers": {}
              }
            }
          ],
          "knowledge_base": [
            {
              "type": "file",
              "name": "<string>",
              "id": "<string>"
            }
          ]
        },
        "first_message": "",
        "language": "en"
      },
      "asr": {
        "quality": "high",
        "provider": "elevenlabs",
        "user_input_audio_format": "pcm_16000",
        "keywords": [
          "<string>"
        ]
      },
      "turn": {
        "turn_timeout": 7
      },
      "tts": {
        "model_id": "eleven_turbo_v2",
        "voice_id": "bYTqZQo3Jz7LQtmGTgwi",
        "agent_output_audio_format": "pcm_16000",
        "optimize_streaming_latency": 0,
        "stability": 0.5,
        "similarity_boost": 0.8
      },
      "conversation": {
        "max_duration_seconds": 600,
        "client_events": [
          "conversation_initiation_metadata"
        ]
      }
    },
    "metadata": {
      "created_at_unix_secs": 123
    },
    "platform_settings": {
      "auth": {
        "enable_auth": false
      },
      "evaluation": {
        "criteria": [
          {
            "id": "<string>",
            "name": "<string>",
            "type": "prompt",
            "conversation_goal_prompt": "<string>"
          }
        ]
      },
      "widget": {
        "variant": "compact",
        "avatar": {
          "type": "orb",
          "color_1": "#2792dc",
          "color_2": "#9ce6e6"
        },
        "custom_avatar_path": "<string>",
        "bg_color": "#ffffff",
        "text_color": "#000000",
        "btn_color": "#000000",
        "btn_text_color": "#ffffff",
        "border_color": "#e1e1e1",
        "focus_color": "#000000",
        "border_radius": 123,
        "btn_radius": 123,
        "action_text": "<string>",
        "start_call_text": "<string>",
        "end_call_text": "<string>",
        "expand_text": "<string>",
        "listening_text": "<string>",
        "speaking_text": "<string>"
      },
      "data_collection": {}
    }
  } */

interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  conversation_config: any;
  metadata: any;
  platform_settings: any;
}

export async function getElevenLabsAgent(agentId: string): Promise<ElevenLabsAgent> {
  try {
    const response = await axios.get(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

interface UpdateElevenLabsAgentInput {
  conversation_config: object;
  platform_settings: object;
  name: string;
}

export async function updateElevenLabsAgent(agentId: string, data: UpdateElevenLabsAgentInput) {
  try {
    const response = await axios.patch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getElevenLabsKnowledgeBases(agentId: string, documentationId: string) {
  try {
    const response = await axios.get(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/knowledge-base/${documentationId}`, {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function addToElevenLabsKnowledgeBase(agentId: string, url: string) {
  try {
    const response = await axios.post(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`, {
      headers: { 'Content-Type': 'multipart/form-data' },
      body: { url }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/* const client = new ElevenLabsClient({ apiKey: "YOUR_API_KEY" });
await client.voices.getAll(); */

export async function getVoices() {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getVoice(voiceId: string) {
  try {
    const response = await axios.get(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getVoiceSettings(voiceId: string) {
  try {
    const response = await axios.get(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

interface EditVoiceSettingsInput {
  stability: number;
  similarity_boost: number;
  style: number;
}

export async function editVoiceSettings(voiceId: string, data: EditVoiceSettingsInput) {
  try {
    const response = await axios.patch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' },
      body: data
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

interface EditVoiceInput {
  name: string;
  files: string[];
  remove_background_noise: boolean;
  description: string;
  labels: string;
}

export async function editVoice(voiceId: string, data: EditVoiceInput) {
  try {
    const response = await axios.patch(`https://api.elevenlabs.io/v1/voices/${voiceId}/edit`, {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || '' },
      body: data
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
