import { FastifyPluginCallback } from "fastify";

const inboundRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get("/inbound-check", async (_request, reply) => {
    reply.send({ message: "Inbound route OK" });
  });

  // Agrega más rutas según necesites.
  done();
};

export default inboundRoutes;
