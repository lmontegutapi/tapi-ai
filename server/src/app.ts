// src/app.ts
import fastify, { FastifyInstance } from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import type { FastifyPluginCallback } from "fastify";

import inboundRoutes from "./routes/inbound.routes";
import outboundRoutes from "./routes/outbound.routes";
import mediaRoutes from "./routes/media.routes";

// Pequeño plugin para un log directo
const logPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.decorate("logInfo", (msg: string) => {
    app.log.info(msg);
  });
  done();
};

/**
 * Construye la instancia de Fastify y registra los plugins y rutas.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: true });

  // Registrar plugin de logging simple
  app.register(logPlugin);

  // Configuración de variables de entorno
  await app.register(fastifyEnv, {
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
        PORT: { type: "number", default: 3000 },
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
  await app.register(fastifyFormBody);
  await app.register(fastifyWs);
  await app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // Registrar rutas
  await app.register(inboundRoutes);
  await app.register(outboundRoutes);
  await app.register(mediaRoutes);

  // Ruta de salud
  app.get("/", async (_, reply) => {
    reply.send({ status: "OK", message: "Server is running" });
  });

  return app;
}

/**
 * Lanza el servidor en el puerto configurado.
 */
export async function startServer(): Promise<void> {
  try {
    const app = await buildApp();
    const port = app.config.PORT || 3000;
    await app.listen({ port: Number(port), host: "0.0.0.0" });
    app.log.info(`Servidor escuchando en el puerto ${port}`);
  } catch (error) {
    console.error("Error iniciando servidor:", error);
    process.exit(1);
  }
}

// Iniciar el servidor solo si se ejecuta directamente este archivo
if (require.main === module) {
  startServer();
}

declare module "fastify" {
  interface FastifyInstance {
    config: {
      ELEVENLABS_API_KEY: string;
      ELEVENLABS_AGENT_ID: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_PHONE_NUMBER: string;
      PORT?: number;
    };
  }
}
