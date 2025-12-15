import { describe, it, expect } from 'vitest';
import { assertRole, defaultPolicy } from '@/src/core/policy';
import { Role } from '@prisma/client';

describe('Core Utilities', () => {
  describe('Policy Enforcement', () => {
    it('should have policy functions', () => {
      expect(assertRole).toBeDefined();
      expect(defaultPolicy).toBeDefined();
    });

    it('should have default policy', () => {
      const result = defaultPolicy({});
      expect(result).toHaveProperty('allow');
      expect(result).toHaveProperty('reason');
    });
  });
});

