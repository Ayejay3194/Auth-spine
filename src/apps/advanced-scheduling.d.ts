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
export declare function createAdvancedBooking(booking: AdvancedBooking): void;
export declare function getBooking(bookingId: string): AdvancedBooking | undefined;
export declare function createRecurringBookings(baseBooking: AdvancedBooking, recurrence: RecurrenceRule): string[];
export declare function allocateResource(allocation: ResourceAllocation): void;
export declare function getResourceAllocations(resourceId: string): ResourceAllocation[];
export declare function createAvailabilityRule(rule: AvailabilityRule): void;
export declare function getStaffAvailability(staffId: string): AvailabilityRule[];
export declare function isStaffAvailable(staffId: string, date: Date, startTime: string): boolean;
export declare function convertTimezone(date: Date, fromTz: string, toTz: string): Date;
export declare function getGroupBookingSlots(serviceId: string, groupSize: number, date: Date): AdvancedBooking[];
//# sourceMappingURL=advanced-scheduling.d.ts.map