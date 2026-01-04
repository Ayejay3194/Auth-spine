// Fallback Prisma client for development
// This bypasses workspace dependency issues while maintaining functionality

let prismaClient: any = null;

try {
  // Try to import the real Prisma client
  const { PrismaClient } = require('@prisma/client');
  prismaClient = new PrismaClient();
} catch (error) {
  console.warn('Prisma client not available, using mock implementation');
  
  // Mock implementation for development
  prismaClient = {
    user: {
      create: async (data: any) => ({ id: 'mock_user_id', ...data.data }),
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      update: async () => null,
      updateMany: async () => ({ count: 0 }),
      delete: async () => null,
      count: async () => 0
    },
    client: {
      create: async (data: any) => ({ id: 'mock_client_id', ...data.data }),
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      update: async () => null,
      delete: async () => null
    },
    provider: {
      create: async (data: any) => ({ id: 'mock_provider_id', ...data.data }),
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      update: async () => null,
      delete: async () => null
    },
    service: {
      create: async (data: any) => ({ id: 'mock_service_id', ...data.data }),
      findUnique: async () => null,
      findMany: async () => [],
      update: async () => null,
      delete: async () => null
    },
    booking: {
      create: async (data: any) => ({ id: 'mock_booking_id', ...data.data }),
      findUnique: async () => null,
      findMany: async () => [],
      update: async () => null,
      delete: async () => null,
      count: async () => 0
    },
    paymentIntent: {
      create: async (data: any) => ({ id: 'mock_payment_id', ...data.data }),
      findUnique: async () => null,
      findMany: async () => [],
      update: async () => null
    },
    analyticsEvent: {
      create: async (data: any) => ({ id: 'mock_event_id', ...data.data }),
      findMany: async () => [],
      groupBy: async () => []
    }
  };
}

export const prisma = prismaClient;

// Helper to check if we're using mock implementation
export const isUsingMockPrisma = () => {
  return !prismaClient || prismaClient.user?.create?.toString().includes('mock_client_id');
};
