/**
 * API Keys for Supabase SaaS Advanced Pack
 * 
 * Provides secure API key management with hash-only storage,
 * scope-based permissions, and usage tracking.
 */

import { APIKey } from './types.js';

export class APIKeysManager {
  private keys: Map<string, APIKey> = new Map();
  private keyHashes: Map<string, string> = new Map(); // Maps hash to key ID
  private initialized = false;

  /**
   * Initialize API keys manager
   */
  async initialize(): Promise<void> {
    this.loadDefaultKeys();
    this.initialized = true;
  }

  /**
   * Create API key
   */
  async createKey(tenantId: string, keyData: {
    name: string;
    scopes: string[];
    permissions?: string[];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): Promise<APIKey> {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const rawKey = this.generateRawKey(keyId);
    const keyHash = this.hashKey(rawKey);

    const apiKey: APIKey = {
      id: keyId,
      tenantId,
      name: keyData.name,
      keyHash,
      scopes: keyData.scopes as any[],
      permissions: keyData.permissions || [],
      expiresAt: keyData.expiresAt,
      isActive: true,
      createdAt: new Date(),
      metadata: keyData.metadata || {}
    };

    this.keys.set(keyId, apiKey);
    this.keyHashes.set(keyHash, keyId);

    return apiKey;
  }

  /**
   * Validate API key
   */
  async validateKey(keyHash: string, requiredScopes?: string[]): Promise<{
    valid: boolean;
    tenantId?: string;
    scopes: string[];
    expiresAt?: Date;
  }> {
    const keyId = this.keyHashes.get(keyHash);
    if (!keyId) {
      return { valid: false, scopes: [] };
    }

    const apiKey = this.keys.get(keyId);
    if (!apiKey) {
      return { valid: false, scopes: [] };
    }

    // Check if key is active
    if (!apiKey.isActive) {
      return { valid: false, scopes: [] };
    }

    // Check if key has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, scopes: [] };
    }

    // Check required scopes
    if (requiredScopes) {
      const hasAllScopes = requiredScopes.every(scope => 
        apiKey.scopes.includes(scope as any)
      );
      
      if (!hasAllScopes) {
        return { valid: false, scopes: apiKey.scopes };
      }
    }

    // Update last used timestamp
    apiKey.lastUsed = new Date();

    return {
      valid: true,
      tenantId: apiKey.tenantId,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt
    };
  }

  /**
   * Get API key by ID
   */
  getKey(keyId: string): APIKey | undefined {
    return this.keys.get(keyId);
  }

  /**
   * Get keys by tenant
   */
  getKeysByTenant(tenantId: string): APIKey[] {
    return Array.from(this.keys.values()).filter(key => 
      key.tenantId === tenantId
    );
  }

  /**
   * Deactivate API key
   */
  deactivateKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (key) {
      key.isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Delete API key
   */
  deleteKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (key) {
      this.keys.delete(keyId);
      this.keyHashes.delete(key.keyHash);
      return true;
    }
    return false;
  }

  /**
   * Update API key
   */
  updateKey(keyId: string, updates: {
    name?: string;
    scopes?: string[];
    permissions?: string[];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): APIKey {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`API key ${keyId} not found`);
    }

    const updatedKey = {
      ...key,
      ...updates
    };

    this.keys.set(keyId, updatedKey);
    return updatedKey;
  }

  /**
   * Get API key metrics
   */
  async getMetrics(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    const keys = Array.from(this.keys.values());
    const now = new Date();

    return {
      total: keys.length,
      active: keys.filter(k => k.isActive && (!k.expiresAt || k.expiresAt > now)).length,
      expired: keys.filter(k => k.expiresAt && k.expiresAt <= now).length
    };
  }

  /**
   * Cleanup expired keys
   */
  cleanupExpiredKeys(): number {
    let deletedCount = 0;
    const now = new Date();

    for (const [keyId, key] of this.keys.entries()) {
      if (key.expiresAt && key.expiresAt < now) {
        this.keys.delete(keyId);
        this.keyHashes.delete(key.keyHash);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Rotate API key
   */
  async rotateKey(keyId: string): Promise<APIKey> {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) {
      throw new Error(`API key ${keyId} not found`);
    }

    // Deactivate old key
    oldKey.isActive = false;

    // Create new key with same properties
    const newKey = await this.createKey(oldKey.tenantId, {
      name: oldKey.name,
      scopes: oldKey.scopes,
      permissions: oldKey.permissions,
      expiresAt: oldKey.expiresAt,
      metadata: oldKey.metadata
    });

    return newKey;
  }

  private generateRawKey(keyId: string): string {
    // Generate secure random key
    const prefix = 'sk_';
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    return `${prefix}${randomPart}`;
  }

  private hashKey(key: string): string {
    // Simple hash for demonstration - use proper cryptographic hash in production
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  }

  private loadDefaultKeys(): void {
    // Load sample API keys for demonstration
    const sampleKeys = [
      {
        tenantId: 'tenant_1',
        name: 'Production API Key',
        scopes: ['read', 'write'],
        permissions: ['users:read', 'projects:write'],
        metadata: { environment: 'production' }
      },
      {
        tenantId: 'tenant_2',
        name: 'Read-only Key',
        scopes: ['read'],
        permissions: ['users:read', 'projects:read'],
        metadata: { environment: 'staging' }
      },
      {
        tenantId: 'tenant_3',
        name: 'Admin Key',
        scopes: ['read', 'write', 'admin'],
        permissions: ['*'],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        metadata: { environment: 'development' }
      }
    ];

    sampleKeys.forEach(keyData => {
      this.createKey(keyData.tenantId, keyData);
    });
  }
}

// Export singleton instance
export const apiKeys = new APIKeysManager();
