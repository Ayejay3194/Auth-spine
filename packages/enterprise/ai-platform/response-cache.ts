/**
 * Response Cache
 * 
 * Caching layer for AI responses to improve performance and reduce costs.
 * 
 * Features:
 * - LRU (Least Recently Used) cache eviction
 * - TTL-based expiration
 * - Hit/miss tracking
 * - Cache warming for popular queries
 * - Semantic similarity matching
 * - Distributed caching support (Redis)
 * - Cache invalidation strategies
 */

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
  expirations: number;
}

export interface CacheConfig {
  maxSize?: number;           // Maximum number of entries
  defaultTTL?: number;        // Default TTL in milliseconds
  checkExpiration?: number;   // How often to check for expired entries (ms)
  enableStats?: boolean;      // Track cache statistics
  similarityThreshold?: number; // For semantic matching (0-1)
}

/**
 * LRU Cache with TTL support
 */
export class ResponseCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 0,
    evictions: 0,
    expirations: 0
  };
  private expirationTimer?: NodeJS.Timeout;

  constructor(config?: CacheConfig) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 60 * 60 * 1000, // 1 hour
      checkExpiration: 60 * 1000,  // 1 minute
      enableStats: true,
      similarityThreshold: 0.9,
      ...config
    };

    this.stats.maxSize = this.config.maxSize;

    // Start expiration checker
    if (this.config.checkExpiration > 0) {
      this.startExpirationChecker();
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.stats.expirations++;
      }
      this.updateHitRate();
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();

    if (this.config.enableStats) this.stats.hits++;
    this.updateHitRate();

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number, metadata?: Record<string, any>): void {
    const existingEntry = this.cache.get(key);

    // Create new entry
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: existingEntry?.hits || 0,
      lastAccessed: Date.now(),
      metadata
    };

    // Evict if necessary
    if (!existingEntry && this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
    this.stats.evictions = 0;
    this.stats.expirations = 0;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all entries
   */
  entries(): CacheEntry<T>[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get popular entries (most hits)
   */
  getPopular(limit = 10): CacheEntry<T>[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  /**
   * Warm cache with popular queries
   */
  async warm(queries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const query of queries) {
      this.set(query.key, query.value, query.ttl);
    }
  }

  /**
   * Find similar cached entries (for semantic matching)
   */
  findSimilar(key: string, limit = 5): CacheEntry<T>[] {
    const results: Array<{ entry: CacheEntry<T>; similarity: number }> = [];

    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) continue;

      const similarity = this.calculateSimilarity(key, entry.key);
      if (similarity >= this.config.similarityThreshold) {
        results.push({ entry, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => r.entry);
  }

  /**
   * Stop the cache (cleanup)
   */
  stop(): void {
    if (this.expirationTimer) {
      clearInterval(this.expirationTimer);
      this.expirationTimer = undefined;
    }
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldest: CacheEntry<T> | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessed < oldest.lastAccessed) {
        oldest = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (this.config.enableStats) this.stats.evictions++;
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Start expiration checker
   */
  private startExpirationChecker(): void {
    this.expirationTimer = setInterval(() => {
      this.checkExpiredEntries();
    }, this.config.checkExpiration);
  }

  /**
   * Check and remove expired entries
   */
  private checkExpiredEntries(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key);
      if (this.config.enableStats) this.stats.expirations++;
    }

    if (toDelete.length > 0) {
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Calculate similarity between two strings (simple)
   * In production, use proper NLP similarity (cosine, Levenshtein, etc.)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    // Simple word overlap similarity
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    const intersection = new Set(
      [...words1].filter(word => words2.has(word))
    );

    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

/**
 * Distributed cache using Redis (stub for future implementation)
 */
export class RedisCache<T = any> {
  private localCache: ResponseCache<T>;

  constructor(config?: CacheConfig & { redisUrl?: string }) {
    // For now, use local cache
    // In production, this would connect to Redis
    this.localCache = new ResponseCache(config);
    
    console.warn('RedisCache: Using local cache fallback. Connect to Redis for distributed caching.');
  }

  async get(key: string): Promise<T | null> {
    // In production: await redis.get(key)
    return this.localCache.get(key);
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // In production: await redis.set(key, value, 'EX', ttl)
    this.localCache.set(key, value, ttl);
  }

  async has(key: string): Promise<boolean> {
    // In production: await redis.exists(key)
    return this.localCache.has(key);
  }

  async delete(key: string): Promise<boolean> {
    // In production: await redis.del(key)
    return this.localCache.delete(key);
  }

  async clear(): Promise<void> {
    // In production: await redis.flushdb()
    this.localCache.clear();
  }

  getStats(): CacheStats {
    return this.localCache.getStats();
  }

  stop(): void {
    this.localCache.stop();
  }
}

/**
 * Cache key generator for consistent hashing
 */
export class CacheKeyGenerator {
  /**
   * Generate cache key from messages
   */
  static fromMessages(messages: Array<{ role: string; content: string }>): string {
    const content = messages.map(m => `${m.role}:${m.content}`).join('|');
    return this.hash(content);
  }

  /**
   * Generate cache key from text
   */
  static fromText(text: string, prefix = ''): string {
    return prefix ? `${prefix}:${this.hash(text)}` : this.hash(text);
  }

  /**
   * Generate cache key with parameters
   */
  static fromParams(params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return this.hash(sorted);
  }

  /**
   * Simple hash function (for demo - use crypto.createHash in production)
   */
  private static hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export { ResponseCache };
