/**
 * Enterprise Booking Package
 * 
 * Comprehensive booking and scheduling system with:
 * - Appointment scheduling and management
 * - Calendar integration
 * - Resource booking
 * - Customer management
 * - Automated reminders
 * - Waitlist management
 * - Availability management
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { BookingService, AppointmentManager } from './service';
export { CalendarManager } from './calendar';
export { AvailabilityManager } from './availability';
export { WaitlistManager } from './waitlist';
export { BookingNotifier } from './notifier';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_BOOKING_SETTINGS } from './config';
export { createAppointment, checkAvailability } from './helpers';
