"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
exports.startServer = startServer;
// src/app.ts
const fastify_1 = __importDefault(require("fastify"));
const env_1 = __importDefault(require("@fastify/env"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const cors_1 = __importDefault(require("@fastify/cors"));
const inbound_routes_1 = __importDefault(require("./routes/inbound.routes"));
const outbound_routes_1 = __importDefault(require("./routes/outbound.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
// Pequeño plugin para un log directo
const logPlugin = (app, _opts, done) => {
    app.decorate("logInfo", (msg) => {
        app.log.info(msg);
    });
    done();
};
/**
 * Construye la instancia de Fastify y registra los plugins y rutas.
 */
async function buildApp() {
    const app = (0, fastify_1.default)({ logger: true });
    // Registrar plugin de logging simple
    app.register(logPlugin);
    // Configuración de variables de entorno
    await app.register(env_1.default, {
        schema: {
            type: "object",
            required: [
                "ELEVENLABS_API_KEY",
                "ELEVENLABS_AGENT_ID",
                "TWILIO_ACCOUNT_SID",
                "TWILIO_AUTH_TOKEN",
                "TWILIO_PHONE_NUMBER",
            ],
            properties: {
                PORT: { type: "number", default: 3001 },
                ELEVENLABS_API_KEY: { type: "string" },
                ELEVENLABS_AGENT_ID: { type: "string" },
                TWILIO_ACCOUNT_SID: { type: "string" },
                TWILIO_AUTH_TOKEN: { type: "string" },
                TWILIO_PHONE_NUMBER: { type: "string" },
            },
        },
        dotenv: true,
        data: process.env,
    });
    // Registrar otros plugins
    await app.register(formbody_1.default);
    await app.register(websocket_1.default);
    await app.register(cors_1.default, {
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    // Registrar rutas
    await app.register(inbound_routes_1.default);
    await app.register(outbound_routes_1.default);
    await app.register(media_routes_1.default);
    // Ruta de salud
    app.get("/", async (_, reply) => {
        reply.send({ status: "OK", message: "Server is running" });
    });
    return app;
}
/**
 * Lanza el servidor en el puerto configurado.
 */
async function startServer() {
    try {
        const app = await buildApp();
        const port = app.config.PORT || 3000;
        await app.listen({ port: Number(port), host: "0.0.0.0" });
        app.log.info(`Servidor escuchando en el puerto ${port}`);
    }
    catch (error) {
        console.error("Error iniciando servidor:", error);
        process.exit(1);
    }
}
// Iniciar el servidor solo si se ejecuta directamente este archivo
if (require.main === module) {
    startServer();
}
