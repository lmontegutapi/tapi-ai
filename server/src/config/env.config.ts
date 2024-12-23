const envSchema = {
  type: "object",
  required: [
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_AGENT_ID",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
  ],
  properties: {
    PORT: {
      type: "number",
      default: 3001,
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    ELEVENLABS_API_KEY: { type: "string" },
    ELEVENLABS_AGENT_ID: { type: "string" },
    TWILIO_ACCOUNT_SID: { type: "string" },
    TWILIO_AUTH_TOKEN: { type: "string" },
    TWILIO_PHONE_NUMBER: { type: "string" },
    RATE_LIMIT_MAX: {
      type: "number",
      default: 100,
    },
    RATE_LIMIT_TIMEWINDOW: {
      type: "number",
      default: 60000,
    },
  },
};

module.exports = { envSchema };
