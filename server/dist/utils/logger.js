"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLogger = void 0;
exports.createLogger = createLogger;
const pino_1 = __importDefault(require("pino"));
const defaultConfig = {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
};
// Configuración para desarrollo
const developmentOptions = {
    level: "debug",
    transport: process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
                colorize: true,
            },
        }
        : undefined,
};
function createLogger(name, config = {}) {
    const mergedConfig = Object.assign(Object.assign(Object.assign({}, defaultConfig), config), { name });
    // Configuración base
    const loggerConfig = Object.assign(Object.assign(Object.assign({}, mergedConfig), developmentOptions), { formatters: {
            level: (label) => {
                return { level: label };
            },
        }, timestamp: pino_1.default.stdTimeFunctions.isoTime });
    if (config.additionalFields) {
        loggerConfig.base = Object.assign({}, config.additionalFields);
    }
    return (0, pino_1.default)(loggerConfig);
}
// Crear un logger global para errores no manejados
exports.globalLogger = createLogger("global", {
    additionalFields: {
        service: "elevenlabs-twilio-integration",
        version: process.env.npm_package_version,
    },
});
