"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mediaRoutes = (fastify, _opts, done) => {
    fastify.get("/media-check", async (_request, reply) => {
        reply.send({ message: "Media route OK" });
    });
    // Agrega más rutas según necesites.
    done();
};
exports.default = mediaRoutes;
