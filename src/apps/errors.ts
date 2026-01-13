// Unified Error Handling System for Auth-Spine

export class AuthSpineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public meta?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthSpineError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthSpineError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      meta: this.meta,
      stack: this.stack,
    };
  }
}

// Authentication Errors
export class AuthenticationError extends AuthSpineError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, meta);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthSpineError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, meta);
    this.name = 'AuthorizationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(meta?: Record<string, any>) {
    super('Token has expired', { ...meta, expired: true });
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(meta?: Record<string, any>) {
    super('Invalid token', { ...meta, invalid: true });
    this.name = 'InvalidTokenError';
  }
}

// Validation Errors
export class ValidationError extends AuthSpineError {
  constructor(message: string, public field?: string, meta?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, { ...meta, field });
    this.name = 'ValidationError';
  }
}

// Database Errors
export class DatabaseError extends AuthSpineError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, meta);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends AuthSpineError {
  constructor(resource: string, id?: string, meta?: Record<string, any>) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      'NOT_FOUND',
      404,
      { ...meta, resource, id }
    );
    this.name = 'NotFoundError';
  }
}

// Business Logic Errors
export class BusinessLogicError extends AuthSpineError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, 'BUSINESS_LOGIC_ERROR', 422, meta);
    this.name = 'BusinessLogicError';
  }
}

export class ConflictError extends AuthSpineError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, 'CONFLICT_ERROR', 409, meta);
    this.name = 'ConflictError';
  }
}

// Rate Limiting Errors
export class RateLimitError extends AuthSpineError {
  constructor(message: string = 'Rate limit exceeded', meta?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', 429, meta);
    this.name = 'RateLimitError';
  }
}

// External Service Errors
export class ExternalServiceError extends AuthSpineError {
  constructor(service: string, message: string, meta?: Record<string, any>) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { ...meta, service });
    this.name = 'ExternalServiceError';
  }
}

// Utility function to create errors from unknown errors
export function createError(error: unknown, defaultMessage: string = 'Unknown error'): AuthSpineError {
  if (error instanceof AuthSpineError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AuthSpineError(error.message, 'UNKNOWN_ERROR', 500, {
      originalError: error.name,
      stack: error.stack,
    });
  }
  
  if (typeof error === 'string') {
    return new AuthSpineError(error, 'UNKNOWN_ERROR', 500);
  }
  
  return new AuthSpineError(defaultMessage, 'UNKNOWN_ERROR', 500, { originalError: error });
}

// Error type guard
export function isAuthSpineError(error: unknown): error is AuthSpineError {
  return error instanceof AuthSpineError;
}

// Error response formatter for API routes
export function formatErrorResponse(error: AuthSpineError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        meta: error.meta,
        stack: error.stack,
      }),
    },
  };
}
