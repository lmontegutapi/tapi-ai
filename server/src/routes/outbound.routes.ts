import { FastifyPluginCallback } from "fastify";
import WebSocket from "ws";
import twilio from "twilio";
import axios from "axios";

const registerOutboundRoutes: FastifyPluginCallback = (
  fastify,
  _opts,
  done
) => {
  // Verificar variables de entorno requeridas
  const {
    ELEVENLABS_API_KEY,
    ELEVENLABS_AGENT_ID,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = fastify.config || process.env;

  if (
    !ELEVENLABS_API_KEY ||
    !ELEVENLABS_AGENT_ID ||
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_PHONE_NUMBER
  ) {
    fastify.log.error("Missing required environment variables");
    throw new Error("Missing required environment variables");
  }

  // Inicializar el cliente de Twilio
  const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // Función auxiliar para obtener signed URL de ElevenLabs
  async function getSignedUrl(): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID!}`,
        {
          headers: { "xi-api-key": ELEVENLABS_API_KEY! },
        }
      );
      if (response.status !== 200) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }
      const data = response.data as { signed_url: string };
      return data.signed_url;
    } catch (error) {
      fastify.log.error("Error getting signed URL:", error);
      throw error;
    }
  }

  // Ruta para iniciar llamada saliente
  fastify.post("/outbound-call", async (request, reply) => {
    const { number, first_message, voiceId, prompt } = request.body as {
      number: string;
      first_message?: string;
      voiceId?: string;
      prompt?: string;
    };
    if (!number) {
      return reply.code(400).send({ error: "Phone number is required" });
    }

    try {
      const call = await twilioClient.calls.create({
        from: TWILIO_PHONE_NUMBER,
        to: number,
        url: `https://${
          request.headers.host
        }/outbound-call-twiml?first_message=${encodeURIComponent(
          first_message || ""
        )}&voiceId=${encodeURIComponent(
          voiceId || ""
        )}&prompt=${encodeURIComponent(prompt || "")}`,
      });

      reply.send({
        success: true,
        message: "Call initiated",
        callSid: call.sid,
      });
    } catch (error) {
      fastify.log.error("Error initiating outbound call:", error);
      reply
        .code(500)
        .send({ success: false, error: "Failed to initiate call" });
    }
  });

  // Ruta TwiML para la llamada
  fastify.all("/outbound-call-twiml", async (request, reply) => {
    const first_message =
      (request.query as { first_message?: string }).first_message || "";
    const voiceId =
      (request.query as { voiceId?: string }).voiceId ||
      process.env.ELEVENLABS_VOICE_ID!;
    const prompt =
      (request.query as { prompt?: string }).prompt ||
      "You are a collection agent, who informs your user of the debt and due date.";
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="wss://${request.headers.host}/outbound-media-stream">
            <Parameter name="first_message" value="${first_message}" />
            <Parameter name="voiceId" value="${voiceId}" />
            <Parameter name="prompt" value="${prompt}" />
          </Stream>
        </Connect>
      </Response>`;
    reply.type("text/xml").send(twimlResponse);
  });

  // WebSocket para manejo de media streams
  fastify.register(async (wsApp) => {
    wsApp.get(
      "/outbound-media-stream",
      { websocket: true },
      (socket /* WebSocket */) => {
        fastify.log.info("[Server] Twilio connected to outbound media stream");
        const ws = socket;

        let streamSid: string | null = null;
        let callSid: string | null = null;
        let elevenLabsWs: WebSocket | null = null;
        let customParameters: Record<string, any> | null = null;

        ws.on("error", (err: any) => {
          fastify.log.error("[Twilio] WS error:", err);
        });

        // Configurar la conexión con ElevenLabs
        const setupElevenLabs = async () => {
          try {
            const signedUrl = await getSignedUrl();
            elevenLabsWs = new WebSocket(signedUrl);

            elevenLabsWs.on("open", () => {
              fastify.log.info("[ElevenLabs] Connected to Conversational AI");
              const initialConfig = {
                type: "conversation_initiation_client_data",
                conversation_config_override: {
                  agent: {
                    tts: {
                      voiceId:
                        customParameters?.voiceId ||
                        process.env.ELEVENLABS_VOICE_ID!,
                    },
                    prompt: {
                      prompt:
                        customParameters?.prompt ||
                        "You are a collection agent, who informs your user of the debt and due date.",
                    },
                    firstMessage:
                      customParameters?.first_message ||
                      "Hola, ¿cómo estás? Su deuda está vencida, por favor pague lo antes posible.",
                  },
                },
              };
              elevenLabsWs?.send(JSON.stringify(initialConfig));
            });

            elevenLabsWs.on("message", (data) => {
              try {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                  case "audio":
                    if (streamSid) {
                      const chunk =
                        message.audio?.chunk ||
                        message.audio_event?.audio_base_64;
                      if (chunk) {
                        const audioData = {
                          event: "media",
                          streamSid,
                          media: { payload: chunk },
                        };
                        ws.send(JSON.stringify(audioData));
                      }
                    }
                    break;
                  case "interruption":
                    if (streamSid) {
                      ws.send(JSON.stringify({ event: "clear", streamSid }));
                    }
                    break;
                  case "ping":
                    if (message.ping_event?.event_id) {
                      elevenLabsWs?.send(
                        JSON.stringify({
                          type: "pong",
                          event_id: message.ping_event.event_id,
                        })
                      );
                    }
                    break;
                  default:
                    fastify.log.info(
                      `[ElevenLabs] Unhandled message type: ${message.type}`
                    );
                }
              } catch (error) {
                fastify.log.error(
                  "[ElevenLabs] Error processing message:",
                  error
                );
              }
            });

            elevenLabsWs.on("error", (error) => {
              fastify.log.error("[ElevenLabs] WebSocket error:", error);
            });

            elevenLabsWs.on("close", () => {
              fastify.log.info("[ElevenLabs] Disconnected");
            });
          } catch (error) {
            fastify.log.error("[ElevenLabs] Setup error:", error);
          }
        };
        setupElevenLabs();

        // Manejar mensajes desde Twilio
        ws.on("message", (message: WebSocket.Data) => {
          try {
            const msg = JSON.parse(message.toString());
            fastify.log.info(`[Twilio] Received event: ${msg.event}`);

            switch (msg.event) {
              case "start":
                streamSid = msg.start.streamSid;
                callSid = msg.start.callSid;
                customParameters = msg.start.customParameters || {};
                fastify.log.info(
                  `[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}`
                );
                break;
              case "media":
                if (
                  elevenLabsWs &&
                  elevenLabsWs.readyState === WebSocket.OPEN
                ) {
                  const audioMessage = {
                    user_audio_chunk: Buffer.from(
                      msg.media.payload,
                      "base64"
                    ).toString("base64"),
                  };
                  if (
                    elevenLabsWs &&
                    elevenLabsWs.readyState === WebSocket.OPEN
                  ) {
                    elevenLabsWs.send(JSON.stringify(audioMessage));
                  }
                }
                break;
              case "stop":
                fastify.log.info(`[Twilio] Stream ${streamSid} ended`);
                if (elevenLabsWs?.readyState === WebSocket.OPEN) {
                  elevenLabsWs.close();
                }
                break;
              default:
                fastify.log.info(`[Twilio] Unhandled event: ${msg.event}`);
            }
          } catch (error) {
            fastify.log.error("[Twilio] Error processing message:", error);
          }
        });

        // Cerrar WebSocket
        ws.on("close", () => {
          fastify.log.info("[Twilio] Client disconnected");
          if (elevenLabsWs?.readyState === WebSocket.OPEN) {
            elevenLabsWs.close();
          }
        });
      }
    );
  });

  done();
};

export default registerOutboundRoutes;
