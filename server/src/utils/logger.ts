import pino from "pino";

interface LoggerConfig {
  name?: string;
  level?: string;
  additionalFields?: Record<string, unknown>;
}

const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
};

// Configuración para desarrollo
const developmentOptions = {
  level: "debug",
  transport:
    process.env.NODE_ENV !== "production"
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

export function createLogger(
  name?: string,
  config: Partial<LoggerConfig> = {}
): pino.Logger {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    name,
  };

  // Configuración base
  const loggerConfig: pino.LoggerOptions = {
    ...mergedConfig,
    ...developmentOptions,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.additionalFields) {
    loggerConfig.base = { ...config.additionalFields };
  }

  return pino(loggerConfig);
}

// Crear un logger global para errores no manejados
export const globalLogger = createLogger("global", {
  additionalFields: {
    service: "elevenlabs-twilio-integration",
    version: process.env.npm_package_version,
  },
});
