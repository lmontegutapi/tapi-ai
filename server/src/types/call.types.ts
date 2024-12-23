export interface CallConfig {
  phoneNumber: string;
  prompt: string;
  host?: string;
  metadata?: Record<string, unknown>;
}

export interface CallStatus {
  callSid: string;
  status:
    | "queued"
    | "ringing"
    | "in-progress"
    | "completed"
    | "failed"
    | "busy"
    | "no-answer";
  duration?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface CallEvent {
  type: "started" | "ringing" | "answered" | "completed" | "failed";
  callSid: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
