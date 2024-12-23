export interface StreamConfig {
  streamId: string;
  prompt?: string;
  firstMessage?: string;
  language?: string;
  voiceId?: string;
  metadata?: Record<string, unknown>;
  type?: "inbound" | "outbound";
}

export interface StreamStatus {
  streamId: string;
  status:
    | "connecting"
    | "connected"
    | "streaming"
    | "paused"
    | "ended"
    | "failed";
  startTime: Date;
  endTime?: Date;
  bytesTransferred?: number;
}

export interface StreamEvent {
  type: "start" | "data" | "pause" | "resume" | "end" | "error";
  streamId: string;
  timestamp: Date;
  payload?: unknown;
}
