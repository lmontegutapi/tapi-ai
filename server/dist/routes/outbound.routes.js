"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const twilio_1 = __importDefault(require("twilio"));
const registerOutboundRoutes = (fastify, _opts, done) => {
    // Verificar variables de entorno requeridas
    const { ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, } = fastify.config || process.env;
    if (!ELEVENLABS_API_KEY ||
        !ELEVENLABS_AGENT_ID ||
        !TWILIO_ACCOUNT_SID ||
        !TWILIO_AUTH_TOKEN ||
        !TWILIO_PHONE_NUMBER) {
        fastify.log.error("Missing required environment variables");
        throw new Error("Missing required environment variables");
    }
    // Inicializar el cliente de Twilio
    const twilioClient = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    // Función auxiliar para obtener signed URL de ElevenLabs
    async function getSignedUrl() {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`, {
                method: "GET",
                headers: { "xi-api-key": ELEVENLABS_API_KEY },
            });
            if (!response.ok) {
                throw new Error(`Failed to get signed URL: ${response.statusText}`);
            }
            const data = (await response.json());
            return data.signed_url;
        }
        catch (error) {
            fastify.log.error("Error getting signed URL:", error);
            throw error;
        }
    }
    // Ruta para iniciar llamada saliente
    fastify.post("/outbound-call", async (request, reply) => {
        const { number, first_message, voiceId, prompt } = request.body;
        if (!number) {
            return reply.code(400).send({ error: "Phone number is required" });
        }
        try {
            const call = await twilioClient.calls.create({
                from: TWILIO_PHONE_NUMBER,
                to: number,
                url: `https://${request.headers.host}/outbound-call-twiml?first_message=${encodeURIComponent(first_message || "")}&voiceId=${encodeURIComponent(voiceId || "")}&prompt=${encodeURIComponent(prompt || "")}`,
            });
            reply.send({
                success: true,
                message: "Call initiated",
                callSid: call.sid,
            });
        }
        catch (error) {
            fastify.log.error("Error initiating outbound call:", error);
            reply
                .code(500)
                .send({ success: false, error: "Failed to initiate call" });
        }
    });
    // Ruta TwiML para la llamada
    fastify.all("/outbound-call-twiml", async (request, reply) => {
        const first_message = request.query.first_message || "";
        const voiceId = request.query.voiceId || "21m00Tcm4TlvDq8ikWAM";
        const prompt = request.query.prompt ||
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
        wsApp.get("/outbound-media-stream", { websocket: true }, (socket /* WebSocket */) => {
            fastify.log.info("[Server] Twilio connected to outbound media stream");
            const ws = socket;
            let streamSid = null;
            let callSid = null;
            let elevenLabsWs = null;
            let customParameters = null;
            ws.on("error", (err) => {
                fastify.log.error("[Twilio] WS error:", err);
            });
            // Configurar la conexión con ElevenLabs
            const setupElevenLabs = async () => {
                try {
                    const signedUrl = await getSignedUrl();
                    elevenLabsWs = new ws_1.default(signedUrl);
                    elevenLabsWs.on("open", () => {
                        fastify.log.info("[ElevenLabs] Connected to Conversational AI");
                        const initialConfig = {
                            type: "conversation_initiation_client_data",
                            conversation_config_override: {
                                agent: {
                                    tts: {
                                        voiceId: (customParameters === null || customParameters === void 0 ? void 0 : customParameters.voiceId) || "21m00Tcm4TlvDq8ikWAM",
                                    },
                                    prompt: {
                                        prompt: (customParameters === null || customParameters === void 0 ? void 0 : customParameters.prompt) ||
                                            "You are a collection agent, who informs your user of the debt and due date.",
                                    },
                                    firstMessage: (customParameters === null || customParameters === void 0 ? void 0 : customParameters.first_message) ||
                                        "Hola, ¿cómo estás? Su deuda está vencida, por favor pague lo antes posible.",
                                },
                            },
                        };
                        elevenLabsWs === null || elevenLabsWs === void 0 ? void 0 : elevenLabsWs.send(JSON.stringify(initialConfig));
                    });
                    elevenLabsWs.on("message", (data) => {
                        var _a, _b, _c;
                        try {
                            const message = JSON.parse(data.toString());
                            switch (message.type) {
                                case "audio":
                                    if (streamSid) {
                                        const chunk = ((_a = message.audio) === null || _a === void 0 ? void 0 : _a.chunk) ||
                                            ((_b = message.audio_event) === null || _b === void 0 ? void 0 : _b.audio_base_64);
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
                                    if ((_c = message.ping_event) === null || _c === void 0 ? void 0 : _c.event_id) {
                                        elevenLabsWs === null || elevenLabsWs === void 0 ? void 0 : elevenLabsWs.send(JSON.stringify({
                                            type: "pong",
                                            event_id: message.ping_event.event_id,
                                        }));
                                    }
                                    break;
                                default:
                                    fastify.log.info(`[ElevenLabs] Unhandled message type: ${message.type}`);
                            }
                        }
                        catch (error) {
                            fastify.log.error("[ElevenLabs] Error processing message:", error);
                        }
                    });
                    elevenLabsWs.on("error", (error) => {
                        fastify.log.error("[ElevenLabs] WebSocket error:", error);
                    });
                    elevenLabsWs.on("close", () => {
                        fastify.log.info("[ElevenLabs] Disconnected");
                    });
                }
                catch (error) {
                    fastify.log.error("[ElevenLabs] Setup error:", error);
                }
            };
            setupElevenLabs();
            // Manejar mensajes desde Twilio
            ws.on("message", (message) => {
                try {
                    const msg = JSON.parse(message.toString());
                    fastify.log.info(`[Twilio] Received event: ${msg.event}`);
                    switch (msg.event) {
                        case "start":
                            streamSid = msg.start.streamSid;
                            callSid = msg.start.callSid;
                            customParameters = msg.start.customParameters || {};
                            fastify.log.info(`[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}`);
                            break;
                        case "media":
                            if (elevenLabsWs &&
                                elevenLabsWs.readyState === ws_1.default.OPEN) {
                                const audioMessage = {
                                    user_audio_chunk: Buffer.from(msg.media.payload, "base64").toString("base64"),
                                };
                                if (elevenLabsWs &&
                                    elevenLabsWs.readyState === ws_1.default.OPEN) {
                                    elevenLabsWs.send(JSON.stringify(audioMessage));
                                }
                            }
                            break;
                        case "stop":
                            fastify.log.info(`[Twilio] Stream ${streamSid} ended`);
                            if ((elevenLabsWs === null || elevenLabsWs === void 0 ? void 0 : elevenLabsWs.readyState) === ws_1.default.OPEN) {
                                elevenLabsWs.close();
                            }
                            break;
                        default:
                            fastify.log.info(`[Twilio] Unhandled event: ${msg.event}`);
                    }
                }
                catch (error) {
                    fastify.log.error("[Twilio] Error processing message:", error);
                }
            });
            // Cerrar WebSocket
            ws.on("close", () => {
                fastify.log.info("[Twilio] Client disconnected");
                if ((elevenLabsWs === null || elevenLabsWs === void 0 ? void 0 : elevenLabsWs.readyState) === ws_1.default.OPEN) {
                    elevenLabsWs.close();
                }
            });
        });
    });
    done();
};
exports.default = registerOutboundRoutes;
