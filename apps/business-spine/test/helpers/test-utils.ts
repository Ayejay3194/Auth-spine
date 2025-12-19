import { PrismaClient } from '@prisma/client';

/**
 * Test utilities for Auth-Spine platform
 */

// Mock Prisma client for testing
export const createMockPrismaClient = (): PrismaClient => {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  } as any;
};

// Test data factories
export const testFactories = {
  user: (overrides = {}) => ({
    id: `user-${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test',
    role: 'USER' as const,
    tenantId: 'test-tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  tenant: (overrides = {}) => ({
    id: `tenant-${Date.now()}`,
    name: `Test Tenant ${Date.now()}`,
    slug: `test-${Date.now()}`,
    domain: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  booking: (overrides = {}) => ({
    id: `booking-${Date.now()}`,
    clientId: `client-${Date.now()}`,
    providerId: `provider-${Date.now()}`,
    serviceId: `service-${Date.now()}`,
    startAt: new Date(Date.now() + 86400000),
    endAt: new Date(Date.now() + 90000000),
    status: 'BOOKED' as const,
    pricePaidCents: 10000,
    tenantId: 'test-tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  client: (overrides = {}) => ({
    id: `client-${Date.now()}`,
    email: `client${Date.now()}@example.com`,
    displayName: `Test Client ${Date.now()}`,
    phone: '+1234567890',
    tenantId: 'test-tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  practitioner: (overrides = {}) => ({
    id: `practitioner-${Date.now()}`,
    userId: `user-${Date.now()}`,
    displayName: `Test Practitioner ${Date.now()}`,
    bio: 'Test bio',
    tenantId: 'test-tenant',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

// API test helpers
export const apiHelpers = {
  createAuthHeaders: (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }),

  createTestToken: (userId: string, role: string = 'USER') => {
    // Simple test token - in production use proper JWT
    return Buffer.from(JSON.stringify({ userId, role })).toString('base64');
  },

  mockRequest: (overrides = {}) => ({
    method: 'GET',
    headers: new Headers(),
    url: 'http://localhost:3000',
    ...overrides,
  }),

  mockResponse: () => ({
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    headers: new Headers(),
  }),
};

// Database test helpers
export const dbHelpers = {
  cleanDatabase: async (prisma: PrismaClient) => {
    // Clean all tables in reverse order of dependencies
    const tables = [
      'webhookDelivery',
      'webhookEndpoint',
      'reportExport',
      'booking',
      'client',
      'practitioner',
      'session',
      'apiKey',
      'user',
      'tenant',
    ];

    for (const table of tables) {
      try {
        await (prisma as any)[table].deleteMany();
      } catch (error) {
        // Table might not exist in test DB
        console.warn(`Could not clean table ${table}:`, error);
      }
    }
  },

  seedTestData: async (prisma: PrismaClient) => {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: testFactories.tenant({ id: 'test-tenant' }),
    });

    // Create test user
    const user = await prisma.user.create({
      data: testFactories.user({ tenantId: tenant.id }),
    });

    return { tenant, user };
  },
};

// Time helpers
export const timeHelpers = {
  now: () => new Date(),
  tomorrow: () => new Date(Date.now() + 86400000),
  yesterday: () => new Date(Date.now() - 86400000),
  inDays: (days: number) => new Date(Date.now() + days * 86400000),
  daysAgo: (days: number) => new Date(Date.now() - days * 86400000),
};

// Test assertions
export const customMatchers = {
  toBeValidUUID: (received: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid UUID`,
    };
  },

  toBeValidEmail: (received: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid email`,
    };
  },

  toBeWithinRange: (received: number, min: number, max: number) => {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => `expected ${received} to be within ${min}-${max}`,
    };
  },
};

// Performance testing helpers
export const perfHelpers = {
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  expectFasterThan: async <T>(fn: () => Promise<T>, maxMs: number): Promise<T> => {
    const { result, duration } = await perfHelpers.measureTime(fn);
    if (duration > maxMs) {
      throw new Error(`Expected operation to complete in ${maxMs}ms, but took ${duration}ms`);
    }
    return result;
  },
};

// Mock Redis client
export const createMockRedis = () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  setex: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
  keys: vi.fn(),
  flushall: vi.fn(),
});

// Environment helpers
export const envHelpers = {
  setTestEnv: (vars: Record<string, string>) => {
    Object.entries(vars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  },

  clearTestEnv: (vars: string[]) => {
    vars.forEach(key => {
      delete process.env[key];
    });
  },

  withTestEnv: async <T>(vars: Record<string, string>, fn: () => Promise<T>): Promise<T> => {
    const originalEnv = { ...process.env };
    try {
      envHelpers.setTestEnv(vars);
      return await fn();
    } finally {
      process.env = originalEnv;
    }
  },
};

