/**
 * Response Cache Integration Tests
 * 
 * Tests for the ResponseCache class covering:
 * - Basic get/set operations
 * - TTL expiration
 * - LRU eviction
 * - Cache statistics
 * - Semantic similarity matching
 * - Cache warming
 */

import { ResponseCache, CacheKeyGenerator } from '../response-cache';

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = new ResponseCache({
      maxSize: 5,
      defaultTTL: 1000, // 1 second for testing
      checkExpiration: 100, // Check every 100ms
      enableStats: true
    });
  });

  afterEach(() => {
    cache.stop();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete entries', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      cache.set('key1', 'value1'); // Uses default 1000ms
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(cache.get('key1')).toBe('value1'); // Still valid
    });

    it('should update lastAccessed on get', () => {
      cache.set('key1', 'value1');
      const entry1 = cache.entries().find(e => e.key === 'key1');
      const firstAccess = entry1?.lastAccessed;
      
      // Small delay
      const now = Date.now();
      while (Date.now() - now < 10) {}
      
      cache.get('key1');
      const entry2 = cache.entries().find(e => e.key === 'key1');
      expect(entry2?.lastAccessed).toBeGreaterThan(firstAccess || 0);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used when full', () => {
      // Fill cache to max (5 entries)
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');
      
      // Access key1 to make it recently used
      cache.get('key1');
      
      // Add new entry - should evict key2 (least recently used)
      cache.set('key6', 'value6');
      
      expect(cache.has('key1')).toBe(true); // Recently accessed, kept
      expect(cache.has('key2')).toBe(false); // Evicted
      expect(cache.has('key6')).toBe(true); // New entry
    });

    it('should track eviction count', () => {
      // Fill cache
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      const statsBefore = cache.getStats();
      
      // Add more to trigger evictions
      cache.set('key5', 'value5');
      cache.set('key6', 'value6');
      
      const statsAfter = cache.getStats();
      expect(statsAfter.evictions).toBeGreaterThan(statsBefore.evictions);
    });
  });

  describe('Cache Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key1'); // Hit
      cache.get('key3'); // Miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track cache size', () => {
      expect(cache.getStats().size).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.getStats().size).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.getStats().size).toBe(2);
      
      cache.delete('key1');
      expect(cache.getStats().size).toBe(1);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key2');
      
      const stats = cache.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      
      cache.resetStats();
      const newStats = cache.getStats();
      expect(newStats.hits).toBe(0);
      expect(newStats.misses).toBe(0);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with popular queries', async () => {
      await cache.warm([
        { key: 'faq1', value: 'answer1' },
        { key: 'faq2', value: 'answer2', ttl: 5000 },
        { key: 'faq3', value: 'answer3' }
      ]);
      
      expect(cache.get('faq1')).toBe('answer1');
      expect(cache.get('faq2')).toBe('answer2');
      expect(cache.get('faq3')).toBe('answer3');
      expect(cache.getStats().size).toBe(3);
    });
  });

  describe('Popular Entries', () => {
    it('should return most accessed entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key2 multiple times
      cache.get('key2');
      cache.get('key2');
      cache.get('key2');
      
      // Access key1 once
      cache.get('key1');
      
      const popular = cache.getPopular(2);
      expect(popular.length).toBe(2);
      expect(popular[0].key).toBe('key2'); // Most hits
      expect(popular[0].hits).toBe(3);
    });
  });

  describe('Semantic Similarity', () => {
    it('should find similar cached entries', () => {
      cache.set('how to reset password', 'Reset instructions');
      cache.set('change my password', 'Password change guide');
      cache.set('business hours', 'Hours info');
      
      const similar = cache.findSimilar('reset my password', 5);
      
      // Should find both password-related entries
      expect(similar.length).toBeGreaterThan(0);
      const keys = similar.map(e => e.key);
      expect(keys.some(k => k.includes('password'))).toBe(true);
    });
  });

  describe('Key Generation', () => {
    it('should generate consistent keys from messages', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      
      const key1 = CacheKeyGenerator.fromMessages(messages);
      const key2 = CacheKeyGenerator.fromMessages(messages);
      
      expect(key1).toBe(key2);
    });

    it('should generate keys from text', () => {
      const key1 = CacheKeyGenerator.fromText('test query');
      const key2 = CacheKeyGenerator.fromText('test query');
      
      expect(key1).toBe(key2);
      expect(typeof key1).toBe('string');
    });

    it('should generate keys with prefix', () => {
      const key = CacheKeyGenerator.fromText('query', 'faq');
      expect(key).toContain('faq:');
    });

    it('should generate keys from params', () => {
      const params = { model: 'gpt-3.5', temperature: 0.7 };
      const key1 = CacheKeyGenerator.fromParams(params);
      const key2 = CacheKeyGenerator.fromParams(params);
      
      expect(key1).toBe(key2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle setting same key multiple times', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      
      expect(cache.get('key1')).toBe('value2');
      expect(cache.getStats().size).toBe(1);
    });

    it('should handle complex objects', () => {
      const obj = { data: [1, 2, 3], nested: { value: 'test' } };
      cache.set('key1', obj);
      
      const retrieved = cache.get('key1');
      expect(retrieved).toEqual(obj);
    });

    it('should handle concurrent access', () => {
      cache.set('key1', 'value1');
      
      // Simulate concurrent reads
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(cache.get('key1'));
      }
      
      expect(results.every(r => r === 'value1')).toBe(true);
    });
  });
});
