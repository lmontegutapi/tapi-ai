interface FineTuningState {
  eleven_multilingual_v2?: string;
  eleven_turbo_v2_5?: string;
  eleven_flash_v2_5?: string;
  eleven_v2_flash?: string;
  eleven_v2_5_flash?: string;
  eleven_turbo_v2?: string;
  eleven_flash_v2?: string;
}

interface FineTuningProgress {
  eleven_flash_v2_5?: number;
  eleven_v2_flash?: number;
  eleven_flash_v2?: number;
  eleven_v2_5_flash?: number;
}

interface FineTuningMessage {
  eleven_flash_v2_5?: string;
  eleven_v2_flash?: string;
  eleven_flash_v2?: string;
  eleven_v2_5_flash?: string;
}

interface FineTuning {
  is_allowed_to_fine_tune: boolean;
  state: FineTuningState;
  verification_failures: any[];
  verification_attempts_count: number;
  manual_verification_requested: boolean;
  language: string;
  progress: FineTuningProgress;
  message: FineTuningMessage;
  dataset_duration_seconds: number | null;
  verification_attempts: any[] | null;
  slice_ids: any[] | null;
  manual_verification: any | null;
  max_verification_attempts: number;
  next_max_verification_attempts_reset_unix_ms: number;
}

interface Labels {
  accent?: string;
  description?: string;
  age?: string;
  gender?: string;
  use_case?: string;
}

interface VoiceVerification {
  requires_verification: boolean;
  is_verified: boolean;
  verification_failures: any[];
  verification_attempts_count: number;
  language: string | null;
  verification_attempts: any[] | null;
}

export interface Voice {
  voice_id: string;
  name: string;
  samples: any | null;
  category: string;
  fine_tuning: FineTuning;
  labels: Labels;
  description: string | null;
  preview_url: string;
  available_for_tiers: any[];
  settings: any | null;
  sharing: any | null;
  high_quality_base_model_ids: string[];
  safety_control: any | null;
  voice_verification: VoiceVerification;
  permission_on_resource: any | null;
  is_owner: boolean;
  is_legacy: boolean;
  is_mixed: boolean;
  created_at_unix: number | null;
}