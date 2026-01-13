import express from 'express'
import rateLimit from 'express-rate-limit'
import csrf from 'csurf'
import helmet from 'helmet'
import { z } from 'zod'
import { AuthError } from './types'

// Rate limiting middleware
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
})

export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts per window
  message: 'Too many refresh attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
})

// CSRF protection
export const csrfProtection = csrf({ cookie: false })

// Security headers
export function setupSecurityHeaders(app: express.Application): void {
  app.use(helmet())
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }))
  app.use(helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }))
  app.use(helmet.noSniff())
  app.use(helmet.xssFilter())
  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }))
}

// Input validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  clientId: z.string()
    .min(1, 'Client ID is required')
    .max(255, 'Client ID is too long'),
  mfaCode: z.string().optional()
})

export const refreshSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(1024, 'Refresh token is invalid'),
  clientId: z.string()
    .min(1, 'Client ID is required')
    .max(255, 'Client ID is too long')
})

export const logoutSchema = z.object({
  sessionId: z.string()
    .min(1, 'Session ID is required')
    .max(255, 'Session ID is invalid')
})

// Payload size limits
export function setupPayloadLimits(app: express.Application): void {
  app.use(express.json({ limit: '10kb' }))
  app.use(express.urlencoded({ limit: '10kb', extended: false }))
}

// Request timeout middleware
export function setupRequestTimeout(app: express.Application, timeoutMs: number = 30000): void {
  app.use((req, res, next) => {
    res.setTimeout(timeoutMs, () => {
      res.status(408).json({ error: 'Request timeout' })
    })
    next()
  })
}

// Error handling middleware
export function errorHandler(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (err instanceof AuthError) {
    res.status(err.status).json({
      error: err.code,
      message: err.message
    })
    return
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: err.errors
    })
    return
  }

  if (err.message === 'EBADCSRFTOKEN') {
    res.status(403).json({
      error: 'CSRF_TOKEN_INVALID',
      message: 'Invalid CSRF token'
    })
    return
  }

  // Log unexpected errors
  console.error('Unexpected error:', err)
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  })
}

// Request ID middleware for tracing
export function requestIdMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  req.id = requestId
  res.setHeader('X-Request-ID', requestId)
  next()
}

// Validation middleware factory
export function validateRequest(schema: z.ZodSchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
        return
      }
      next(error)
    }
  }
}
