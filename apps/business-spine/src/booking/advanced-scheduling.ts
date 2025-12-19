export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface AdvancedBooking {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  startISO: string;
  endISO: string;
  timezone: string;
  recurrence?: RecurrenceRule;
  resources: string[];
  groupSize: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  bookingId: string;
  quantity: number;
  allocatedAt: Date;
}

export interface AvailabilityRule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  exceptions: Date[];
}

const bookings = new Map<string, AdvancedBooking>();
const resources = new Map<string, ResourceAllocation>();
const availabilityRules = new Map<string, AvailabilityRule>();

export function createAdvancedBooking(booking: AdvancedBooking): void {
  bookings.set(booking.id, booking);
}

export function getBooking(bookingId: string): AdvancedBooking | undefined {
  return bookings.get(bookingId);
}

export function createRecurringBookings(
  baseBooking: AdvancedBooking,
  recurrence: RecurrenceRule
): string[] {
  const bookingIds: string[] = [];
  const startDate = new Date(baseBooking.startISO);
  let currentDate = new Date(startDate);
  let count = 0;

  while (
    (!recurrence.endDate || currentDate <= recurrence.endDate) &&
    (!recurrence.occurrences || count < recurrence.occurrences)
  ) {
    const booking: AdvancedBooking = {
      ...baseBooking,
      id: `booking_${Date.now()}_${count}`,
      startISO: currentDate.toISOString(),
      endISO: new Date(currentDate.getTime() + 60 * 60 * 1000).toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createAdvancedBooking(booking);
    bookingIds.push(booking.id);

    // Increment date based on frequency
    switch (recurrence.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + recurrence.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * recurrence.interval);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval);
        break;
    }

    count++;
  }

  return bookingIds;
}

export function allocateResource(allocation: ResourceAllocation): void {
  resources.set(allocation.id, allocation);
}

export function getResourceAllocations(resourceId: string): ResourceAllocation[] {
  return Array.from(resources.values()).filter(r => r.resourceId === resourceId);
}

export function createAvailabilityRule(rule: AvailabilityRule): void {
  availabilityRules.set(rule.id, rule);
}

export function getStaffAvailability(staffId: string): AvailabilityRule[] {
  return Array.from(availabilityRules.values()).filter(r => r.staffId === staffId);
}

export function isStaffAvailable(staffId: string, date: Date, startTime: string): boolean {
  const dayOfWeek = date.getDay();
  const rules = getStaffAvailability(staffId);

  for (const rule of rules) {
    if (rule.dayOfWeek === dayOfWeek && rule.isAvailable) {
      if (!rule.exceptions.some(d => d.toDateString() === date.toDateString())) {
        return true;
      }
    }
  }

  return false;
}

export function convertTimezone(date: Date, fromTz: string, toTz: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const converted = new Date(
    parseInt(parts[4].value),
    parseInt(parts[0].value) - 1,
    parseInt(parts[2].value),
    parseInt(parts[6].value),
    parseInt(parts[8].value),
    parseInt(parts[10].value)
  );

  return converted;
}

export function getGroupBookingSlots(
  serviceId: string,
  groupSize: number,
  date: Date
): AdvancedBooking[] {
  return Array.from(bookings.values()).filter(
    b =>
      b.serviceId === serviceId &&
      b.groupSize >= groupSize &&
      new Date(b.startISO).toDateString() === date.toDateString() &&
      b.status === 'scheduled'
  );
}
