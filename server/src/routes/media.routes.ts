import { FastifyPluginCallback } from "fastify";

const mediaRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get("/media-check", async (_request, reply) => {
    reply.send({ message: "Media route OK" });
  });

  // Agrega más rutas según necesites.
  done();
};

export default mediaRoutes;
