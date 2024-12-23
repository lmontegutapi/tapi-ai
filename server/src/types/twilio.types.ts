export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface TwilioCallParams {
  to: string;
  prompt: string;
  host?: string;
}

export interface TwilioWSMessage {
  event: "start" | "media" | "stop";
  start?: {
    streamSid: string;
    callSid: string;
    customParameters?: Record<string, unknown>;
  };
  media?: {
    payload: string;
  };
}
