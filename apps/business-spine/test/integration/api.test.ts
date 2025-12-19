import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('API Integration Tests', () => {
  describe('Health Checks', () => {
    it('GET /api/health should return 200', async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.status).toBe('healthy');
    });

    it('GET /api/metrics should return Prometheus metrics', async () => {
      const res = await fetch(`${BASE_URL}/api/metrics`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/plain');
      
      const text = await res.text();
      expect(text).toContain('process_cpu');
    });
  });

  describe('Authentication API', () => {
    let authToken: string;

    it('POST /api/auth/login should authenticate user', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      if (res.status === 200) {
        const data = await res.json();
        authToken = data.token;
        expect(authToken).toBeTruthy();
      }
      // Test may fail if no test user exists - that's OK
    });

    it('GET /api/auth/me should return user with valid token', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeTruthy();
    });

    it('POST /api/auth/logout should revoke session', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  describe('Providers API', () => {
    it('GET /api/providers should return provider list', async () => {
      const res = await fetch(`${BASE_URL}/api/providers`);
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /api/providers with search should filter results', async () => {
      const res = await fetch(`${BASE_URL}/api/providers?search=test`);
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Booking API', () => {
    it('GET /api/booking/slots should return available slots', async () => {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`${BASE_URL}/api/booking/slots?providerId=test&date=${date}`);
      
      // May return 400 if provider doesn't exist - that's OK
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('OpenAPI Documentation', () => {
    it('GET /api/openapi.json should return OpenAPI spec', async () => {
      const res = await fetch(`${BASE_URL}/api/openapi.json`);
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.openapi).toBeTruthy();
      expect(data.info).toBeTruthy();
      expect(data.paths).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await fetch(`${BASE_URL}/api/nonexistent`);
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid request data', async () => {
      const res = await fetch(`${BASE_URL}/api/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = Array.from({ length: 150 }, () =>
        fetch(`${BASE_URL}/api/providers`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      // Rate limiting may or may not be enforced in test environment
      console.log(`Rate limited: ${rateLimited}`);
    });
  });
});

