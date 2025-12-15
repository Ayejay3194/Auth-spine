/**
 * Business Spine Error Handler
 *
 * Provides centralized error handling and reporting.
 */
import { getLogger } from "./logger.js";
const logger = getLogger("error-handler");
export class BusinessSpineError extends Error {
    code;
    details;
    statusCode;
    constructor(code, message, details, statusCode = 500) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = statusCode;
        this.name = "BusinessSpineError";
        Object.setPrototypeOf(this, BusinessSpineError.prototype);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
export class ValidationError extends BusinessSpineError {
    constructor(message, details) {
        super("VALIDATION_ERROR", message, details, 400);
        this.name = "ValidationError";
    }
}
export class NotFoundError extends BusinessSpineError {
    constructor(message, details) {
        super("NOT_FOUND", message, details, 404);
        this.name = "NotFoundError";
    }
}
export class UnauthorizedError extends BusinessSpineError {
    constructor(message = "Unauthorized", details) {
        super("UNAUTHORIZED", message, details, 401);
        this.name = "UnauthorizedError";
    }
}
export class ForbiddenError extends BusinessSpineError {
    constructor(message = "Forbidden", details) {
        super("FORBIDDEN", message, details, 403);
        this.name = "ForbiddenError";
    }
}
export class ConflictError extends BusinessSpineError {
    constructor(message, details) {
        super("CONFLICT", message, details, 409);
        this.name = "ConflictError";
    }
}
export class TimeoutError extends BusinessSpineError {
    constructor(message = "Request timeout", details) {
        super("TIMEOUT", message, details, 408);
        this.name = "TimeoutError";
    }
}
export class RateLimitError extends BusinessSpineError {
    constructor(message = "Rate limit exceeded", details) {
        super("RATE_LIMIT_EXCEEDED", message, details, 429);
        this.name = "RateLimitError";
    }
}
/**
 * Global error handler
 */
export function handleError(error) {
    if (error instanceof BusinessSpineError) {
        logger.warn("Business spine error", {
            code: error.code,
            message: error.message,
            details: error.details,
        });
        return error;
    }
    if (error instanceof Error) {
        logger.error("Unhandled error", error);
        return new BusinessSpineError("INTERNAL_ERROR", error.message, { stack: error.stack }, 500);
    }
    logger.error("Unknown error", undefined, { error });
    return new BusinessSpineError("INTERNAL_ERROR", "An unknown error occurred", error, 500);
}
/**
 * Async error wrapper
 */
export function asyncHandler(fn) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            throw handleError(error);
        }
    };
}
/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 100, maxDelay = 5000, backoffMultiplier = 2, } = options;
    let lastError;
    let delay = initialDelay;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
                    delay,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay = Math.min(delay * backoffMultiplier, maxDelay);
            }
        }
    }
    throw handleError(lastError);
}
