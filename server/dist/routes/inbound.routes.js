"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inboundRoutes = (fastify, _opts, done) => {
    fastify.get("/inbound-check", async (_request, reply) => {
        reply.send({ message: "Inbound route OK" });
    });
    // Agrega más rutas según necesites.
    done();
};
exports.default = inboundRoutes;
