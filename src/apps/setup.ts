import { beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-characters-long';
  }
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'test-session-secret-key';
  }
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  }
  if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://localhost:6379';
  }
});

// Clean up after tests
afterAll(async () => {
  // Clean up any test data
  // Close connections if needed
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock external services
vi.mock('@/src/notifications/adapters/sendgrid', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/src/notifications/adapters/twilio', () => ({
  sendSMS: vi.fn().mockResolvedValue({ success: true }),
}));

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
    createdAt: new Date(),
  }),
  createMockSession: () => ({
    token: 'mock-session-token',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }),
};

declare global {
  var testUtils: {
    createMockUser: () => any;
    createMockSession: () => any;
  };
}

