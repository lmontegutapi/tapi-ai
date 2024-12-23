export interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
}

export interface ConversationConfig {
  agent: {
    prompt: {
      prompt: string;
    };
    first_message: string;
  };
}

export interface ElevenLabsMessage {
  type: string;
  conversation_config_override?: {
    agent: {
      prompt: { prompt: string };
      first_message: string;
    };
  };
  audio?: {
    chunk: string;
  };
  audio_event?: {
    audio_base_64: string;
  };
  ping_event?: {
    event_id: string;
  };
}