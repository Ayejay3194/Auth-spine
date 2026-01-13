import { describe, it, expect } from 'vitest';

describe('Business Spines', () => {
  describe('Booking Spine', () => {
    it('should exist and be importable', async () => {
      const { bookingSpine } = await import('@/src/spines');
      expect(bookingSpine).toBeDefined();
    });
  });

  describe('CRM Spine', () => {
    it('should exist and be importable', async () => {
      const { crmSpine } = await import('@/src/spines');
      expect(crmSpine).toBeDefined();
    });
  });

  describe('Payments Spine', () => {
    it('should exist and be importable', async () => {
      const { paymentsSpine } = await import('@/src/spines');
      expect(paymentsSpine).toBeDefined();
    });
  });

  describe('Marketing Spine', () => {
    it('should exist and be importable', async () => {
      const { marketingSpine } = await import('@/src/spines');
      expect(marketingSpine).toBeDefined();
    });
  });

  describe('Analytics Spine', () => {
    it('should exist and be importable', async () => {
      const { analyticsSpine } = await import('@/src/spines');
      expect(analyticsSpine).toBeDefined();
    });
  });

  describe('Admin/Security Spine', () => {
    it('should exist and be importable', async () => {
      const { admin_securitySpine } = await import('@/src/spines');
      expect(admin_securitySpine).toBeDefined();
    });
  });
});

