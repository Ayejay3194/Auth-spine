/**
 * Secrets management for SaaS applications
 * Implements critical security controls for secret rotation and storage
 */

// Mock Buffer for development
const mockBuffer = {
  from: (data: string, encoding?: string) => ({
    toString: (enc: string) => encoding === 'base64' ? atob(data) : data,
    length: data.length
  })
};

export interface SecretMetadata {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  expiresAt?: string;
  lastRotated: string;
  nextRotation?: string;
  environment: 'development' | 'staging' | 'production';
  tenantId?: string;
}

export interface SecretValue {
  value: string;
  checksum: string;
  encrypted: boolean;
}

export interface SecretRotationPolicy {
  rotationInterval: number; // days
  autoRotate: boolean;
  notifyBefore: number; // days before expiration
}

/**
 * Secrets management system
 */
export class SecretsManager {
  private secrets = new Map<string, SecretMetadata>();
  private secretValues = new Map<string, SecretValue>();
  private rotationPolicies = new Map<string, SecretRotationPolicy>();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // Default rotation policies for different secret types
    this.rotationPolicies.set('api_key', {
      rotationInterval: 90,
      autoRotate: true,
      notifyBefore: 7
    });
    
    this.rotationPolicies.set('database_password', {
      rotationInterval: 60,
      autoRotate: true,
      notifyBefore: 3
    });
    
    this.rotationPolicies.set('webhook_secret', {
      rotationInterval: 180,
      autoRotate: false,
      notifyBefore: 14
    });
  }

  /**
   * Creates a new secret
   */
  async createSecret(
    name: string,
    value: string,
    type: string,
    tenantId?: string,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): Promise<string> {
    const secretId = this.generateSecretId(name);
    const now = new Date().toISOString();
    
    const metadata: SecretMetadata = {
      id: secretId,
      name,
      version: 1,
      createdAt: now,
      lastRotated: now,
      environment,
      tenantId
    };

    const policy = this.rotationPolicies.get(type);
    if (policy) {
      const nextRotation = new Date();
      nextRotation.setDate(nextRotation.getDate() + policy.rotationInterval);
      metadata.nextRotation = nextRotation.toISOString();
    }

    const secretValue: SecretValue = {
      value: this.encryptValue(value),
      checksum: this.generateChecksum(value),
      encrypted: true
    };

    this.secrets.set(secretId, metadata);
    this.secretValues.set(secretId, secretValue);

    return secretId;
  }

  /**
   * Retrieves a secret value
   */
  async getSecret(secretId: string, tenantId?: string): Promise<string | null> {
    const metadata = this.secrets.get(secretId);
    if (!metadata) {
      return null;
    }

    // Verify tenant access if tenant-specific secret
    if (metadata.tenantId && metadata.tenantId !== tenantId) {
      throw new Error('Unauthorized access to tenant secret');
    }

    const secretValue = this.secretValues.get(secretId);
    if (!secretValue) {
      return null;
    }

    return this.decryptValue(secretValue.value);
  }

  /**
   * Rotates a secret
   */
  async rotateSecret(secretId: string, newValue?: string): Promise<boolean> {
    const metadata = this.secrets.get(secretId);
    if (!metadata) {
      return false;
    }

    const currentValue = await this.getSecret(secretId);
    if (!currentValue) {
      return false;
    }

    const value = newValue || this.generateNewValue(metadata.name);
    const now = new Date().toISOString();

    // Update metadata
    metadata.version += 1;
    metadata.lastRotated = now;

    const policy = this.rotationPolicies.get(this.getSecretType(metadata.name));
    if (policy) {
      const nextRotation = new Date();
      nextRotation.setDate(nextRotation.getDate() + policy.rotationInterval);
      metadata.nextRotation = nextRotation.toISOString();
    }

    // Update secret value
    const secretValue: SecretValue = {
      value: this.encryptValue(value),
      checksum: this.generateChecksum(value),
      encrypted: true
    };

    this.secretValues.set(secretId, secretValue);

    // Log rotation
    console.log(`[SECRET_ROTATION] Rotated secret: ${metadata.name} (v${metadata.version})`);

    return true;
  }

  /**
   * Checks for secrets that need rotation
   */
  async checkRotationSchedule(): Promise<string[]> {
    const now = new Date();
    const dueForRotation: string[] = [];

    for (const [secretId, metadata] of this.secrets) {
      if (!metadata.nextRotation) continue;

      const nextRotation = new Date(metadata.nextRotation);
      const policy = this.rotationPolicies.get(this.getSecretType(metadata.name));
      
      if (policy && policy.autoRotate && nextRotation <= now) {
        dueForRotation.push(secretId);
      }
    }

    return dueForRotation;
  }

  /**
   * Gets secrets expiring soon
   */
  async getExpiringSecrets(days: number = 30): Promise<SecretMetadata[]> {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    const expiring: SecretMetadata[] = [];

    for (const metadata of this.secrets.values()) {
      if (metadata.expiresAt) {
        const expiryDate = new Date(metadata.expiresAt);
        if (expiryDate <= threshold) {
          expiring.push(metadata);
        }
      } else if (metadata.nextRotation) {
        const nextRotation = new Date(metadata.nextRotation);
        if (nextRotation <= threshold) {
          expiring.push(metadata);
        }
      }
    }

    return expiring;
  }

  /**
   * Validates secret integrity
   */
  async validateSecret(secretId: string): Promise<boolean> {
    const metadata = this.secrets.get(secretId);
    const secretValue = this.secretValues.get(secretId);
    
    if (!metadata || !secretValue) {
      return false;
    }

    const currentValue = await this.getSecret(secretId);
    if (!currentValue) {
      return false;
    }

    const currentChecksum = this.generateChecksum(currentValue);
    return currentChecksum === secretValue.checksum;
  }

  private generateSecretId(name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `sec_${name}_${timestamp}_${random}`;
  }

  private encryptValue(value: string): string {
    // In production, use proper encryption (AWS KMS, Azure Key Vault, etc.)
    // For demo, we'll use base64 encoding
    return mockBuffer.from(value).toString('base64');
  }

  private decryptValue(encryptedValue: string): string {
    // In production, use proper decryption
    // For demo, we'll use base64 decoding
    return mockBuffer.from(encryptedValue, 'base64').toString();
  }

  private generateChecksum(value: string): string {
    // Generate SHA-256 checksum
    // Mock implementation for development
    const mockCrypto = {
      createHash: (algorithm: string) => ({
        update: (data: string) => ({
          digest: (encoding: string) => `hash_${data.length}`
        })
      })
    };
    return mockCrypto.createHash('sha256').update(value).digest('hex');
  }

  private generateNewValue(secretName: string): string {
    // Generate appropriate value based on secret type
    if (secretName.includes('api_key')) {
      return this.generateApiKey();
    }
    if (secretName.includes('password')) {
      return this.generatePassword();
    }
    if (secretName.includes('secret')) {
      return this.generateWebhookSecret();
    }
    
    return this.generateRandomString(32);
  }

  private generateApiKey(): string {
    return `ak_${this.generateRandomString(40)}`;
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private generateWebhookSecret(): string {
    return `whsec_${this.generateRandomString(32)}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getSecretType(name: string): string {
    if (name.includes('api_key')) return 'api_key';
    if (name.includes('password')) return 'database_password';
    if (name.includes('webhook')) return 'webhook_secret';
    return 'api_key'; // default
  }

  /**
   * Lists all secrets for a tenant
   */
  async listTenantSecrets(tenantId: string): Promise<SecretMetadata[]> {
    return Array.from(this.secrets.values()).filter(s => s.tenantId === tenantId);
  }

  /**
   * Deletes a secret
   */
  async deleteSecret(secretId: string): Promise<boolean> {
    const deleted = this.secrets.delete(secretId);
    this.secretValues.delete(secretId);
    return deleted;
  }
}
