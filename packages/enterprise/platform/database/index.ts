// Database adapters for platform modules
export * from './ClientAdapter.js';
export * from './ProfessionalAdapter.js';
export { DatabaseService as DatabaseServiceModel } from './ServiceAdapter.js';
export * from './BookingAdapter.js';
export * from './PaymentAdapter.js';
export * from './AnalyticsAdapter.js';

// Import adapter classes for factory function
import { PrismaClientAdapter } from './ClientAdapter.js';
import { PrismaProfessionalAdapter } from './ProfessionalAdapter.js';
import { PrismaServiceAdapter } from './ServiceAdapter.js';
import { PrismaBookingAdapter } from './BookingAdapter.js';
import { PrismaPaymentAdapter } from './PaymentAdapter.js';
import { PrismaAnalyticsAdapter } from './AnalyticsAdapter.js';

// Factory function to create database adapters
export function createDatabaseAdapters(prisma: any) {
  return {
    client: new PrismaClientAdapter(prisma),
    professional: new PrismaProfessionalAdapter(prisma),
    service: new PrismaServiceAdapter(prisma),
    booking: new PrismaBookingAdapter(prisma),
    payment: new PrismaPaymentAdapter(prisma),
    analytics: new PrismaAnalyticsAdapter(prisma)
  };
}
