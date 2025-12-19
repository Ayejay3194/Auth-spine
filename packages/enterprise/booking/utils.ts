/**
 * Booking Utils - Utility functions for booking system
 */

import { BookingRequest, Appointment } from './types';

export class BookingUtils {
  /**
   * Validate booking request
   */
  static validateBookingRequest(request: BookingRequest): string[] {
    const errors: string[] = [];

    if (!request.serviceId) {
      errors.push('Service ID is required');
    }

    if (!request.customerId) {
      errors.push('Customer ID is required');
    }

    if (!request.startTime) {
      errors.push('Start time is required');
    }

    if (request.startTime <= new Date()) {
      errors.push('Start time must be in the future');
    }

    return errors;
  }

  /**
   * Format appointment time
   */
  static formatAppointmentTime(date: Date): string {
    return date.toLocaleString();
  }

  /**
   * Calculate appointment duration
   */
  static calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Check if appointment is in the past
   */
  static isPastAppointment(appointment: Appointment): boolean {
    return appointment.endTime < new Date();
  }

  /**
   * Generate booking reference
   */
  static generateBookingReference(): string {
    return `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
}
