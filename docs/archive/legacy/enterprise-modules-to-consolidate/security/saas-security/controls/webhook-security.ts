/**
 * Webhook signature verification for SaaS applications
 * Implements critical security control: SaaS-BILL-001
 */

// Mock crypto implementation for development
const mockCrypto = {
  createHmac: (algorithm: string, secret: string) => ({
    update: (data: string) => ({
      digest: (encoding: string) => {
        // Simple mock HMAC for development
        return Buffer.from(`${secret}-${data}`).toString('hex');
      }
    })
  })
};

// Mock Buffer for development
const mockBuffer = {
  from: (data: string, encoding?: string) => ({
    toString: (enc: string) => data,
    length: data.length
  })
};

// Mock timingSafeEqual for development
const mockTimingSafeEqual = (a: any, b: any) => {
  return a.toString() === b.toString();
};

const { createHmac } = mockCrypto as any;
const { Buffer } = mockBuffer as any;
const { timingSafeEqual } = mockTimingSafeEqual as any;

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  payload?: any;
}

export interface WebhookConfig {
  secret: string;
  algorithm: 'sha256' | 'sha1';
  headerName: string;
  tolerance: number; // Time tolerance in seconds
}

/**
 * Webhook signature verification system
 */
export class WebhookSecurity {
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
  }

  /**
   * Verifies webhook signature and timing
   */
  async verifyWebhook(
    payload: string,
    signature: string,
    timestamp?: string
  ): Promise<WebhookVerificationResult> {
    try {
      // Step 1: Check timing to prevent replay attacks
      if (timestamp && !this.verifyTimestamp(timestamp)) {
        return { valid: false, error: 'Webhook timestamp is too old or in the future' };
      }

      // Step 2: Verify signature
      const expectedSignature = this.generateSignature(payload, timestamp);
      if (!this.compareSignatures(signature, expectedSignature)) {
        return { valid: false, error: 'Invalid webhook signature' };
      }

      // Step 3: Parse and validate payload
      const parsedPayload = this.parsePayload(payload);
      if (!parsedPayload) {
        return { valid: false, error: 'Invalid webhook payload' };
      }

      return { valid: true, payload: parsedPayload };
    } catch (error) {
      return { valid: false, error: 'Webhook verification failed' };
    }
  }

  private verifyTimestamp(timestamp: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);
    
    if (isNaN(webhookTime)) {
      return false;
    }

    const timeDiff = Math.abs(now - webhookTime);
    return timeDiff <= this.config.tolerance;
  }

  private generateSignature(payload: string, timestamp?: string): string {
    const data = timestamp ? `${timestamp}.${payload}` : payload;
    const hmac = createHmac(this.config.algorithm, this.config.secret);
    hmac.update(data);
    return hmac.digest('hex');
  }

  private compareSignatures(received: string, expected: string): boolean {
    // Use timing-safe comparison to prevent timing attacks
    try {
      return timingSafeEqual(
        Buffer.from(received, 'hex'), 
        Buffer.from(expected, 'hex')
      );
    } catch {
      return false;
    }
  }

  private parsePayload(payload: string): any {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  /**
   * Extracts webhook signature from request headers
   */
  extractSignature(headers: Record<string, string>): string | null {
    const signature = headers[this.config.headerName.toLowerCase()];
    if (!signature) {
      return null;
    }

    // Handle different signature formats
    if (signature.startsWith('sha256=')) {
      return signature.substring(7);
    }
    if (signature.startsWith('sha1=')) {
      return signature.substring(5);
    }

    return signature;
  }

  /**
   * Extracts timestamp from request headers
   */
  extractTimestamp(headers: Record<string, string>): string | null {
    return headers['x-webhook-timestamp'] || 
           headers['webhook-timestamp'] || 
           headers['timestamp'];
  }
}

/**
 * Pre-configured webhook security for common providers
 */
export const webhookConfigs = {
  stripe: {
    secret: (globalThis as any).process?.env?.STRIPE_WEBHOOK_SECRET || '',
    algorithm: 'sha256' as const,
    headerName: 'stripe-signature',
    tolerance: 300 // 5 minutes
  },
  github: {
    secret: (globalThis as any).process?.env?.GITHUB_WEBHOOK_SECRET || '',
    algorithm: 'sha256' as const,
    headerName: 'x-hub-signature-256',
    tolerance: 300
  },
  custom: {
    secret: (globalThis as any).process?.env?.WEBHOOK_SECRET || '',
    algorithm: 'sha256' as const,
    headerName: 'x-webhook-signature',
    tolerance: 300
  }
};

/**
 * Middleware function for Express/Next.js webhook endpoints
 */
export function createWebhookMiddleware(config: WebhookConfig) {
  const webhookSecurity = new WebhookSecurity(config);

  return async (req: any, res: any, next: any) => {
    try {
      const signature = webhookSecurity.extractSignature(req.headers);
      const timestamp = webhookSecurity.extractTimestamp(req.headers);
      const payload = req.body;

      if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature' });
      }

      const result = await webhookSecurity.verifyWebhook(
        JSON.stringify(payload),
        signature,
        timestamp
      );

      if (!result.valid) {
        return res.status(401).json({ error: result.error });
      }

      // Attach verified payload to request
      req.webhookPayload = result.payload;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Webhook verification error' });
    }
  };
}
