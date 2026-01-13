/**
 * Edge Functions for Supabase Advanced Features Pack
 * 
 * Provides Edge Functions with middleware, auth gates, rate limiting,
 * webhooks, and cron jobs for Supabase.
 */

import { EdgeFunctionEnvironment, RateLimitResult, WebhookPayload, CronJobResult } from './types.js';

export class EdgeFunctionsManager {
  private config: EdgeFunctionEnvironment;
  private functions: Map<string, any> = new Map();
  private middleware: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize Edge Functions
   */
  async initialize(config: any): Promise<void> {
    this.config = {
      middleware: {
        auth: {
          enabled: true,
          jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
          requiredClaims: ['exp', 'iat', 'sub']
        },
        cors: {
          enabled: true,
          origins: ['http://localhost:3000'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          headers: ['Content-Type', 'Authorization']
        },
        rateLimit: {
          enabled: true,
          requests: 100,
          window: 60000, // 1 minute
          storage: 'memory'
        }
      },
      functions: [],
      webhooks: {
        handlers: [],
        queue: {
          enabled: true,
          maxRetries: 3,
          deadLetterQueue: 'webhooks_failed'
        }
      },
      cron: {
        jobs: [],
        storage: 'memory'
      }
    };
    
    await this.loadMiddleware();
    await this.loadFunctions();
    this.initialized = true;
  }

  /**
   * Execute Edge Function
   */
  async execute(functionName: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}): Promise<{
    data: any;
    error: any;
    status: number;
  }> {
    const func = this.functions.get(functionName);
    if (!func) {
      return {
        data: null,
        error: { message: 'Function not found' },
        status: 404
      };
    }

    try {
      // Create mock request
      const request = new Request(`https://example.com/${func.path}`, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      // Create context
      const context = {
        req: request,
        env: {},
        client: this.supabaseClient,
        user: null,
        metadata: {}
      };

      // Execute middleware chain
      const middlewareResult = await this.executeMiddleware(func.middleware, context);
      if (!middlewareResult.allowed) {
        return {
          data: null,
          error: { message: middlewareResult.error },
          status: middlewareResult.status || 401
        };
      }

      // Execute function
      const result = await this.executeFunction(func.handler, context);
      
      return {
        data: result.data,
        error: result.error,
        status: result.status || 200
      };
    } catch (error) {
      return {
        data: null,
        error: { message: error.message },
        status: 500
      };
    }
  }

  /**
   * Add Edge Function
   */
  async addFunction(functionDef: {
    name: string;
    path: string;
    method: string[];
    middleware: string[];
    handler: string;
  }): Promise<void> {
    this.functions.set(functionDef.name, functionDef);
  }

  /**
   * Add middleware
   */
  async addMiddleware(name: string, handler: (context: any) => Promise<any>): Promise<void> {
    this.middleware.set(name, handler);
  }

  /**
   * Send webhook
   */
  async sendWebhook(url: string, payload: WebhookPayload, options: {
    retries?: number;
    timeout?: number;
    secret?: string;
  } = {}): Promise<{
    success: boolean;
    attempts: number;
    error?: string;
  }> {
    const retries = options.retries || 3;
    const timeout = options.timeout || 10000;
    const secret = options.secret || '';

    let attempts = 0;
    let lastError: string | undefined;

    for (let i = 0; i <= retries; i++) {
      attempts++;
      
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Advanced-Features/1.0'
        };

        if (secret) {
          const signature = this.generateSignature(JSON.stringify(payload), secret);
          headers['X-Signature'] = signature;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeout)
        });

        if (response.ok) {
          return { success: true, attempts };
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        lastError = error.message;
      }

      // Wait before retry (exponential backoff)
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    return {
      success: false,
      attempts,
      error: lastError
    };
  }

  /**
   * Schedule cron job
   */
  async scheduleCronJob(jobDef: {
    name: string;
    schedule: string;
    handler: string;
    enabled?: boolean;
  }): Promise<void> {
    const job = {
      ...jobDef,
      enabled: jobDef.enabled !== false,
      lastRun: null,
      nextRun: this.calculateNextRun(jobDef.schedule)
    };

    this.config.cron.jobs.push(job);
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate templates
   */
  generateTemplates(): {
    middleware: string;
    auth: string;
    rateLimit: string;
    webhook: string;
    cron: string;
  } {
    return {
      middleware: this.generateMiddlewareTemplate(),
      auth: this.generateAuthTemplate(),
      rateLimit: this.generateRateLimitTemplate(),
      webhook: this.generateWebhookTemplate(),
      cron: this.generateCronTemplate()
    };
  }

  private async executeMiddleware(middlewareNames: string[], context: any): Promise<{
    allowed: boolean;
    error?: string;
    status?: number;
  }> {
    for (const name of middlewareNames) {
      const middleware = this.middleware.get(name);
      if (middleware) {
        const result = await middleware(context);
        if (!result.allowed) {
          return result;
        }
      }
    }
    return { allowed: true };
  }

  private async executeFunction(handler: string, context: any): Promise<{
    data: any;
    error?: any;
    status?: number;
  }> {
    try {
      // In a real implementation, this would execute the actual function
      // For now, return a mock result
      return {
        data: { message: 'Function executed successfully', context },
        status: 200
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
        status: 500
      };
    }
  }

  private generateSignature(payload: string, secret: string): string {
    // Generate HMAC signature for webhook verification
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private calculateNextRun(schedule: string): Date {
    // Simple cron-like calculation (in real implementation, use a proper cron parser)
    const now = new Date();
    const nextRun = new Date(now.getTime() + 60000); // 1 minute from now
    return nextRun;
  }

  private loadMiddleware(): void {
    // Auth middleware
    this.addMiddleware('auth', async (context: any) => {
      if (!this.config.middleware.auth.enabled) {
        return { allowed: true };
      }

      const authHeader = context.req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { allowed: false, error: 'Missing or invalid authorization header', status: 401 };
      }

      const token = authHeader.substring(7);
      try {
        // Verify JWT token (mock implementation)
        const user = await this.verifyJWT(token);
        context.user = user;
        return { allowed: true };
      } catch (error) {
        return { allowed: false, error: 'Invalid token', status: 401 };
      }
    });

    // CORS middleware
    this.addMiddleware('cors', async (context: any) => {
      if (!this.config.middleware.cors.enabled) {
        return { allowed: true };
      }

      const origin = context.req.headers.get('Origin');
      if (origin && !this.config.middleware.cors.origins.includes(origin)) {
        return { allowed: false, error: 'CORS policy violation', status: 403 };
      }

      // Add CORS headers
      context.corsHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': this.config.middleware.cors.methods.join(', '),
        'Access-Control-Allow-Headers': this.config.middleware.cors.headers.join(', ')
      };

      return { allowed: true };
    });

    // Rate limiting middleware
    this.addMiddleware('rateLimit', async (context: any) => {
      if (!this.config.middleware.rateLimit.enabled) {
        return { allowed: true };
      }

      const clientId = context.req.headers.get('X-Client-ID') || 'anonymous';
      const result = await this.checkRateLimit(clientId);
      
      if (!result.allowed) {
        return {
          allowed: false,
          error: 'Rate limit exceeded',
          status: 429,
          headers: {
            'X-RateLimit-Limit': this.config.middleware.rateLimit.requests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
            'Retry-After': result.retryAfter?.toString()
          }
        };
      }

      context.rateLimit = result;
      return { allowed: true };
    });
  }

  private loadFunctions(): void {
    // Load default functions
    const defaultFunctions = [
      {
        name: 'hello-world',
        path: '/hello',
        method: ['GET', 'POST'],
        middleware: ['cors'],
        handler: 'helloWorldHandler'
      },
      {
        name: 'protected-route',
        path: '/protected',
        method: ['GET', 'POST'],
        middleware: ['cors', 'auth', 'rateLimit'],
        handler: 'protectedHandler'
      }
    ];

    defaultFunctions.forEach(func => {
      this.functions.set(func.name, func);
    });
  }

  private async verifyJWT(token: string): Promise<any> {
    // Mock JWT verification
    // In real implementation, use proper JWT library
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async checkRateLimit(clientId: string): Promise<RateLimitResult> {
    // Mock rate limiting implementation
    // In real implementation, use Redis or other storage
    const requests = Math.floor(Math.random() * this.config.middleware.rateLimit.requests);
    const remaining = Math.max(0, this.config.middleware.rateLimit.requests - requests);
    const resetTime = new Date(Date.now() + this.config.middleware.rateLimit.window);
    const allowed = requests < this.config.middleware.rateLimit.requests;

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(this.config.middleware.rateLimit.window / 1000)
    };
  }

  private generateMiddlewareTemplate(): string {
    return `
// Edge Function Middleware Template
import { createClient } from '@supabase/supabase-js';

interface MiddlewareContext {
  req: Request;
  env: Record<string, string>;
  client: any;
  user?: any;
  metadata: Record<string, any>;
}

interface MiddlewareResult {
  allowed: boolean;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

// Auth Middleware
export const authMiddleware = async (context: MiddlewareContext): Promise<MiddlewareResult> => {
  const authHeader = context.req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      allowed: false,
      error: 'Missing or invalid authorization header',
      status: 401
    };
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await context.client.auth.getUser(token);
    
    if (error || !user) {
      return {
        allowed: false,
        error: 'Invalid token',
        status: 401
      };
    }

    context.user = user;
    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      error: 'Token verification failed',
      status: 401
    };
  }
};

// CORS Middleware
export const corsMiddleware = (allowedOrigins: string[] = ['*']) => {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const origin = context.req.headers.get('Origin');
    
    if (allowedOrigins[0] !== '*' && !allowedOrigins.includes(origin || '')) {
      return {
        allowed: false,
        error: 'CORS policy violation',
        status: 403
      };
    }

    context.metadata.corsHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    return { allowed: true };
  };
};

// Rate Limiting Middleware
export const rateLimitMiddleware = (requests: number, window: number) => {
  const storage = new Map<string, { count: number; resetTime: number }>();
  
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const clientId = context.req.headers.get('X-Client-ID') || 'anonymous';
    const now = Date.now();
    
    let clientData = storage.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 0,
        resetTime: now + window
      };
      storage.set(clientId, clientData);
    }
    
    clientData.count++;
    
    if (clientData.count > requests) {
      return {
        allowed: false,
        error: 'Rate limit exceeded',
        status: 429,
        headers: {
          'X-RateLimit-Limit': requests.toString(),
          'X-RateLimit-Remaining': Math.max(0, requests - clientData.count).toString(),
          'X-RateLimit-Reset': Math.ceil(clientData.resetTime / 1000).toString(),
          'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString()
        }
      };
    }
    
    context.metadata.rateLimit = {
      remaining: Math.max(0, requests - clientData.count),
      resetTime: new Date(clientData.resetTime)
    };
    
    return { allowed: true };
  };
};

// Middleware Chain Executor
export const executeMiddleware = async (
  middleware: Array<(context: MiddlewareContext) => Promise<MiddlewareResult>>,
  context: MiddlewareContext
): Promise<MiddlewareResult> => {
  for (const mw of middleware) {
    const result = await mw(context);
    if (!result.allowed) {
      return result;
    }
  }
  return { allowed: true };
};
`;
  }

  private generateAuthTemplate(): string {
    return `
// Authentication Template for Edge Functions
import { createClient } from '@supabase/supabase-js';

export class AuthGuard {
  private supabase: any;
  private jwtSecret: string;

  constructor(supabaseUrl: string, supabaseKey: string, jwtSecret: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.jwtSecret = jwtSecret;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async requireAuth(req: Request): Promise<any> {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.substring(7);
    return await this.verifyToken(token);
  }

  async requireRole(req: Request, requiredRole: string): Promise<any> {
    const user = await this.requireAuth(req);
    
    if (!user.user_metadata?.role || user.user_metadata.role !== requiredRole) {
      throw new Error('Insufficient permissions');
    }
    
    return user;
  }

  async requirePermission(req: Request, permission: string): Promise<any> {
    const user = await this.requireAuth(req);
    
    const permissions = user.app_metadata?.permissions || [];
    
    if (!permissions.includes(permission)) {
      throw new Error('Permission denied');
    }
    
    return user;
  }
}

// Usage example:
const authGuard = new AuthGuard(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  Deno.env.get('JWT_SECRET')!
);

// In your Edge Function:
Deno.serve(async (req) => {
  try {
    const user = await authGuard.requireAuth(req);
    
    return new Response(
      JSON.stringify({ message: 'Hello, ' + user.email }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
`;
  }

  private generateRateLimitTemplate(): string {
    return `
// Rate Limiting Template for Edge Functions
interface RateLimitStorage {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, value: { count: number; resetTime: number }): Promise<void>;
  increment(key: string): Promise<{ count: number; resetTime: number }>;
}

export class RateLimiter {
  private storage: RateLimitStorage;
  private requests: number;
  private window: number;

  constructor(storage: RateLimitStorage, requests: number, window: number) {
    this.storage = storage;
    this.requests = requests;
    this.window = window;
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const key = \`rate_limit:\${identifier}\`;
    
    let data = await this.storage.get(key);
    
    if (!data || now > data.resetTime) {
      data = {
        count: 0,
        resetTime: now + this.window
      };
      await this.storage.set(key, data);
    }
    
    data = await this.storage.increment(key);
    
    const allowed = data.count <= this.requests;
    const remaining = Math.max(0, this.requests - data.count);
    const resetTime = new Date(data.resetTime);
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((data.resetTime - now) / 1000)
    };
  }
}

// Memory-based storage (for development)
class MemoryStorage implements RateLimitStorage {
  private storage = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.storage.get(key);
    return data || null;
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.storage.set(key, value);
  }

  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const data = this.storage.get(key);
    if (!data) {
      throw new Error('Key not found');
    }
    data.count++;
    this.storage.set(key, data);
    return data;
  }
}

// Redis-based storage (for production)
class RedisStorage implements RateLimitStorage {
  private redis: any;

  constructor(redis: any) {
    this.redis = redis;
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'PX', value.resetTime - Date.now());
  }

  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const ttl = await this.redis.pttl(key);
    if (ttl < 0) {
      throw new Error('Key not found or expired');
    }
    
    const count = await this.redis.incr(key);
    return {
      count,
      resetTime: Date.now() + ttl
    };
  }
}

// Usage example:
const memoryStorage = new MemoryStorage();
const rateLimiter = new RateLimiter(memoryStorage, 100, 60000); // 100 requests per minute

Deno.serve(async (req) => {
  const clientId = req.headers.get('X-Client-ID') || 'anonymous';
  const result = await rateLimiter.checkLimit(clientId);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
          'Retry-After': result.retryAfter?.toString() || ''
        }
      }
    );
  }
  
  return new Response('Hello, rate-limited world!');
});
`;
  }

  private generateWebhookTemplate(): string {
    return `
// Webhook Template for Edge Functions
export interface WebhookPayload {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
  signature: string;
}

export class WebhookSender {
  private secret: string;
  private retries: number;
  private timeout: number;

  constructor(secret: string, retries: number = 3, timeout: number = 10000) {
    this.secret = secret;
    this.retries = retries;
    this.timeout = timeout;
  }

  async send(url: string, payload: WebhookPayload): Promise<{
    success: boolean;
    attempts: number;
    error?: string;
  }> {
    const signedPayload = {
      ...payload,
      signature: this.generateSignature(payload)
    };

    let attempts = 0;
    let lastError: string | undefined;

    for (let i = 0; i <= this.retries; i++) {
      attempts++;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Supabase-Webhooks/1.0',
            'X-Webhook-Signature': signedPayload.signature
          },
          body: JSON.stringify(signedPayload),
          signal: AbortSignal.timeout(this.timeout)
        });

        if (response.ok) {
          return { success: true, attempts };
        } else {
          lastError = \`HTTP \${response.status}: \${response.statusText}\`;
        }
      } catch (error) {
        lastError = error.message;
      }

      // Exponential backoff
      if (i < this.retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    return {
      success: false,
      attempts,
      error: lastError
    };
  }

  private generateSignature(payload: any): string {
    const crypto = require('crypto');
    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', this.secret).update(payloadString).digest('hex');
  }
}

// Webhook receiver
export class WebhookReceiver {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  verify(payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private generateSignature(payload: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
  }
}

// Usage example:
const webhookSender = new WebhookSender(Deno.env.get('WEBHOOK_SECRET')!);

// Send webhook
const payload: WebhookPayload = {
  id: crypto.randomUUID(),
  event: 'user.created',
  data: { userId: '123', email: 'user@example.com' },
  timestamp: new Date(),
  signature: ''
};

const result = await webhookSender.send('https://example.com/webhook', payload);

// Receive webhook
const webhookReceiver = new WebhookReceiver(Deno.env.get('WEBHOOK_SECRET')!);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get('X-Webhook-Signature');

  if (!signature || !webhookReceiver.verify(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(body);
  console.log('Received webhook:', payload);

  return new Response('Webhook received', { status: 200 });
});
`;
  }

  private generateCronTemplate(): string {
    return `
// Cron Job Template for Edge Functions
export interface CronJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

export class CronScheduler {
  private jobs: Map<string, CronJob> = new Map();
  private running: boolean = false;

  addJob(job: CronJob): void {
    this.jobs.set(job.name, job);
  }

  removeJob(name: string): void {
    this.jobs.delete(name);
  }

  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.runScheduler();
  }

  stop(): void {
    this.running = false;
  }

  private async runScheduler(): Promise<void> {
    while (this.running) {
      const now = new Date();
      
      for (const job of this.jobs.values()) {
        if (job.enabled && now >= job.nextRun) {
          try {
            await job.handler();
            job.lastRun = now;
          } catch (error) {
            console.error(\`Cron job \${job.name} failed:\`, error);
          }
          
          job.nextRun = this.calculateNextRun(job.schedule, now);
        }
      }
      
      // Check every minute
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  private calculateNextRun(schedule: string, from: Date): Date {
    // Simple cron implementation (in production, use a proper cron library)
    const next = new Date(from);
    
    // Parse basic cron patterns (hourly, daily, weekly, monthly)
    if (schedule === 'hourly') {
      next.setHours(next.getHours() + 1);
      next.setMinutes(0, 0, 0);
    } else if (schedule === 'daily') {
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    } else if (schedule === 'weekly') {
      next.setDate(next.getDate() + 7);
      next.setHours(0, 0, 0, 0);
    } else if (schedule === 'monthly') {
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
    } else {
      // Default to 1 hour from now
      next.setHours(next.getHours() + 1);
    }
    
    return next;
  }
}

// Example cron jobs
const cleanupDatabase = async (): Promise<void> => {
  console.log('Running database cleanup...');
  // Add cleanup logic here
};

const sendDailyReport = async (): Promise<void> => {
  console.log('Sending daily report...');
  // Add report logic here
};

const processQueue = async (): Promise<void> => {
  console.log('Processing queue...');
  // Add queue processing logic here
};

// Usage example:
const scheduler = new CronScheduler();

scheduler.addJob({
  name: 'cleanup-database',
  schedule: 'daily',
  handler: cleanupDatabase,
  enabled: true,
  nextRun: new Date() // Start immediately
});

scheduler.addJob({
  name: 'daily-report',
  schedule: 'daily',
  handler: sendDailyReport,
  enabled: true,
  nextRun: new Date()
});

scheduler.addJob({
  name: 'process-queue',
  schedule: 'hourly',
  handler: processQueue,
  enabled: true,
  nextRun: new Date()
});

scheduler.start();

// Edge Function to manage cron jobs
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  if (path === '/start') {
    scheduler.start();
    return new Response('Cron scheduler started');
  }
  
  if (path === '/stop') {
    scheduler.stop();
    return new Response('Cron scheduler stopped');
  }
  
  if (path === '/status') {
    const jobs = Array.from(scheduler['jobs'].values()).map(job => ({
      name: job.name,
      schedule: job.schedule,
      enabled: job.enabled,
      lastRun: job.lastRun,
      nextRun: job.nextRun
    }));
    
    return new Response(JSON.stringify({ jobs }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not found', { status: 404 });
});
`;
  }
}

// Export singleton instance
export const edgeFunctions = new EdgeFunctionsManager();
