"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastifyConfig = {
    logger: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        serializers: {
            req(request) {
                return {
                    method: request.method,
                    url: request.url,
                    headers: request.headers,
                    hostname: request.hostname,
                    remoteAddress: request.ip,
                    remotePort: request.socket.remotePort,
                };
            },
        },
    },
    trustProxy: true,
    disableRequestLogging: false,
};
module.exports = { fastifyConfig };
