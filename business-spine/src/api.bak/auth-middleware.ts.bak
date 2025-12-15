import express, { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  tenantId?: string;
  role?: string;
}

const logger = new Logger({ level: 'info', format: 'json' });

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!authHeader) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    if (!tenantId) {
      res.status(400).json({ error: 'Missing X-Tenant-ID header' });
      return;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization scheme' });
      return;
    }

    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const expectedToken = process.env.BUSINESS_SPINE_API_KEY;
    if (!expectedToken || token !== expectedToken) {
      logger.warn('Invalid API key attempt', { ip: req.ip });
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    req.tenantId = tenantId;
    req.userId = req.headers['x-user-id'] as string || 'system';
    req.role = req.headers['x-user-role'] as string || 'user';

    logger.info('Request authenticated', {
      userId: req.userId,
      tenantId: req.tenantId,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Authentication error', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (authHeader && tenantId) {
      const [scheme, token] = authHeader.split(' ');

      if (scheme === 'Bearer' && token) {
        const expectedToken = process.env.BUSINESS_SPINE_API_KEY;
        if (expectedToken && token === expectedToken) {
          req.tenantId = tenantId;
          req.userId = req.headers['x-user-id'] as string || 'system';
          req.role = req.headers['x-user-role'] as string || 'user';
        }
      }
    }

    if (!req.tenantId) {
      req.tenantId = process.env.TENANT_ID || 'default-tenant';
    }

    if (!req.userId) {
      req.userId = 'anonymous';
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error', error);
    next();
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
