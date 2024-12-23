"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ValidationError = exports.CallError = exports.StreamError = exports.AppError = void 0;
class AppError extends Error {
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
        };
    }
}
exports.AppError = AppError;
class StreamError extends AppError {
    constructor(message, details) {
        super("STREAM_ERROR", message, 500, details);
        this.name = "StreamError";
    }
}
exports.StreamError = StreamError;
class CallError extends AppError {
    constructor(message, details) {
        super("CALL_ERROR", message, 500, details);
        this.name = "CallError";
    }
}
exports.CallError = CallError;
class ValidationError extends AppError {
    constructor(message, details) {
        super("VALIDATION_ERROR", message, 400, details);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
// Middleware para manejo de errores
const errorHandler = (error, logger) => {
    if (error instanceof AppError) {
        logger.error({
            err: error,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details,
        }, error.message);
        return {
            success: false,
            error: error.toJSON(),
        };
    }
    // Error no manejado
    logger.error({
        err: error,
        stack: error.stack,
    }, "Unhandled error occurred");
    return {
        success: false,
        error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
            statusCode: 500,
        },
    };
};
exports.errorHandler = errorHandler;
