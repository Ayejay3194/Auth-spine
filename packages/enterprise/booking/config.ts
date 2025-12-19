/**
 * Booking Configuration - Default configurations for booking system
 */

import { BookingSettings, WorkingHours } from './types';

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  timezone: 'UTC',
  advanceBookingLimit: 30,
  cancellationWindow: 24,
  reminderTiming: [24, 2],
  allowOnlineBooking: true,
  requireDeposit: false,
  depositPercentage: 0,
  autoConfirmBookings: true,
  enableWaitlist: true,
  businessHours: {
    monday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { isEnabled: false },
    sunday: { isEnabled: false }
  }
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
  tuesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
  wednesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
  thursday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
  friday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
  saturday: { isEnabled: false },
  sunday: { isEnabled: false }
};
