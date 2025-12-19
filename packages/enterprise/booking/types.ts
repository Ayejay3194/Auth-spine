/**
 * Booking System Type Definitions
 * 
 * Comprehensive type definitions for the enterprise booking system
 * with strict typing for maximum type safety and functionality.
 */

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  deposit?: number;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  color?: string;
  requiresDeposit: boolean;
  depositAmount?: number;
  cancellationPolicy: CancellationPolicy;
  bufferTime?: number; // in minutes
  maxAdvanceBooking?: number; // in days
  isActive: boolean;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  services: string[]; // service IDs
  workingHours: WorkingHours;
  timezone: string;
  isActive: boolean;
  avatar?: string;
  specialties?: string[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  notes?: string;
  tags?: string[];
  loyaltyPoints?: number;
  membershipStatus?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isEnabled: boolean;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  breakStart?: string; // HH:MM format
  breakEnd?: string; // HH:MM format
}

export interface AvailabilitySlot {
  id: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  appointmentId?: string;
  reason?: string;
}

export interface WaitlistEntry {
  id: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  preferredDate?: Date;
  preferredTimeRange?: TimeRange;
  flexibility: FlexibilityLevel;
  notes?: string;
  status: WaitlistStatus;
  createdAt: Date;
  contactedAt?: Date;
}

export interface BookingSettings {
  timezone: string;
  advanceBookingLimit: number; // days
  cancellationWindow: number; // hours
  reminderTiming: number[]; // hours before appointment
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  autoConfirmBookings: boolean;
  enableWaitlist: boolean;
  businessHours: WorkingHours;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'blocked' | 'break' | 'meeting';
  resourceId?: string;
  color?: string;
  description?: string;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface BookingRequest {
  serviceId: string;
  staffId?: string;
  customerId: string;
  startTime: Date;
  notes?: string;
  depositAmount?: number;
}

export interface BookingConfirmation {
  appointment: Appointment;
  customer: Customer;
  service: Service;
  staff: Staff;
  totalAmount: number;
  depositAmount?: number;
  nextSteps: string[];
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum WaitlistStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  BOOKED = 'booked',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum FlexibilityLevel {
  EXACT = 'exact',
  PLUS_MINUS_1_HOUR = 'plus_minus_1_hour',
  SAME_DAY = 'same_day',
  ANY_TIME = 'any_time'
}

export enum CancellationPolicy {
  FLEXIBLE = 'flexible', // 24 hours
  MODERATE = 'moderate', // 48 hours
  STRICT = 'strict', // 72 hours
  VERY_STRICT = 'very_strict' // 7 days
}

export interface BookingAnalytics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShows: number;
  revenue: number;
  averageBookingValue: number;
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  staffPerformance: Array<{
    staffId: string;
    staffName: string;
    appointments: number;
    revenue: number;
    rating?: number;
  }>;
  timeSlotUtilization: Array<{
    timeSlot: string;
  utilization: number;
  }>;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    confirmation: boolean;
    reminder: boolean;
    cancellation: boolean;
    rescheduling: boolean;
  };
  sms: {
    enabled: boolean;
    confirmation: boolean;
    reminder: boolean;
    cancellation: boolean;
    rescheduling: boolean;
  };
  push: {
    enabled: boolean;
    confirmation: boolean;
    reminder: boolean;
    cancellation: boolean;
    rescheduling: boolean;
  };
}

export interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'facility';
  capacity?: number;
  location?: string;
  description?: string;
  isActive: boolean;
  bookingRules?: ResourceBookingRules;
}

export interface ResourceBookingRules {
  maxConcurrentBookings: number;
  minBookingDuration: number; // minutes
  maxBookingDuration: number; // minutes
  advanceBookingLimit: number; // days
  cancellationWindow: number; // hours
}

export interface RecurringAppointment {
  id: string;
  baseAppointment: Omit<Appointment, 'id' | 'startTime' | 'endTime'>;
  recurrencePattern: RecurrencePattern;
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
  isActive: boolean;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  weekOfMonth?: number; // 1-5 (first, second, etc.)
  monthOfYear?: number; // 1-12
}
