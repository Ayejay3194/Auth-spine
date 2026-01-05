# CALENDAR & COORDINATION - PHASE 7

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** Multi-user scheduling, calendar integration, and availability coordination

---

## 📅 CALENDAR FEATURES

### Calendar Integration
```typescript
interface CalendarIntegration {
  providers: {
    google: GoogleCalendarProvider;
    outlook: OutlookCalendarProvider;
    apple: AppleCalendarProvider;
    custom: CustomCalendarProvider;
  };
  
  sync: {
    realTime: boolean;
    interval: number; // seconds
    conflictResolution: 'server_wins' | 'client_wins' | 'manual';
  };
  
  permissions: {
    read: string[];
    write: string[];
    share: string[];
  };
}
```

### Calendar Provider Interface
```typescript
interface CalendarProvider {
  name: string;
  authenticate(): Promise<AuthResult>;
  getCalendars(): Promise<Calendar[]>;
  getEvents(calendarId: string, startDate: Date, endDate: Date): Promise<Event[]>;
  createEvent(calendarId: string, event: CreateEventRequest): Promise<Event>;
  updateEvent(eventId: string, updates: Partial<Event>): Promise<Event>;
  deleteEvent(eventId: string): Promise<void>;
  subscribeToChanges(callback: (events: Event[]) => void): () => void;
}

interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  timezone: string;
  owner: string;
  permissions: CalendarPermission[];
  provider: string;
  isPrimary: boolean;
}

interface CalendarPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer' | 'free_busy';
  canRead: boolean;
  canWrite: boolean;
  canShare: boolean;
}
```

---

## 👥 MULTI-USER SCHEDULING LOGIC

### Availability Checker
```typescript
class MultiUserAvailabilityChecker {
  async findAvailableTimeSlots(
    request: AvailabilityRequest
  ): Promise<AvailabilityResponse> {
    const {
      attendeeIds,
      duration,
      dateRange,
      timezone,
      constraints = {}
    } = request;
    
    // 1. Get all calendar accounts for each person
    const calendarAccounts = await this.getCalendarAccountsForUsers(attendeeIds);
    
    // 2. Fetch events for all attendees in the date range
    const allEvents = await this.fetchEventsForAttendees(
      calendarAccounts,
      dateRange,
      timezone
    );
    
    // 3. Analyze events to find free time slots
    const freeSlots = this.calculateFreeSlots(
      allEvents,
      dateRange,
      duration,
      constraints
    );
    
    // 4. Rank and filter suggestions
    const rankedSlots = this.rankTimeSlots(freeSlots, constraints);
    
    return {
      availableSlots: rankedSlots,
      attendeeAvailability: this.summarizeAvailability(allEvents, attendeeIds),
      conflicts: this.identifyConflicts(allEvents),
      suggestions: this.generateSuggestions(rankedSlots, constraints)
    };
  }
  
  private async getCalendarAccountsForUsers(
    attendeeIds: string[]
  ): Promise<Map<string, Calendar[]>> {
    const userCalendars = new Map<string, Calendar[]>();
    
    for (const userId of attendeeIds) {
      const calendars = await this.getUserCalendars(userId);
      userCalendars.set(userId, calendars);
    }
    
    return userCalendars;
  }
  
  private async fetchEventsForAttendees(
    calendarAccounts: Map<string, Calendar[]>,
    dateRange: DateRange,
    timezone: string
  ): Promise<Map<string, Event[]>> {
    const allEvents = new Map<string, Event[]>();
    
    for (const [userId, calendars] of calendarAccounts) {
      const userEvents: Event[] = [];
      
      for (const calendar of calendars) {
        try {
          const events = await this.getEventsForCalendar(
            calendar.id,
            dateRange.start,
            dateRange.end
          );
          
          // Convert all times to user's timezone
          const convertedEvents = events.map(event => ({
            ...event,
            startTime: this.convertTimeZone(event.startTime, timezone),
            endTime: this.convertTimeZone(event.endTime, timezone)
          }));
          
          userEvents.push(...convertedEvents);
        } catch (error) {
          console.warn(`Failed to fetch events for calendar ${calendar.id}:`, error);
        }
      }
      
      allEvents.set(userId, userEvents);
    }
    
    return allEvents;
  }
  
  private calculateFreeSlots(
    allEvents: Map<string, Event[]>,
    dateRange: DateRange,
    duration: number,
    constraints: SchedulingConstraints
  ): TimeSlot[] {
    const busySlots = this.mergeBusySlots(allEvents);
    const workingHours = constraints.workingHours || { start: 9, end: 17 };
    
    const freeSlots: TimeSlot[] = [];
    
    // Iterate through each day in the date range
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(workingHours.start, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(workingHours.end, 0, 0, 0);
      
      // Find free slots within working hours
      const dayFreeSlots = this.findFreeSlotsInDay(
        dayStart,
        dayEnd,
        busySlots,
        duration
      );
      
      freeSlots.push(...dayFreeSlots);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return freeSlots;
  }
  
  private mergeBusySlots(allEvents: Map<string, Event[]>): BusySlot[] {
    const allBusySlots: BusySlot[] = [];
    
    for (const [userId, events] of allEvents) {
      for (const event of events) {
        if (event.status === 'confirmed') {
          allBusySlots.push({
            userId,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            eventId: event.id,
            title: event.title
          });
        }
      }
    }
    
    // Sort by start time
    allBusySlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    // Merge overlapping slots
    return this.mergeOverlappingSlots(allBusySlots);
  }
  
  private mergeOverlappingSlots(slots: BusySlot[]): BusySlot[] {
    const merged: BusySlot[] = [];
    
    for (const slot of slots) {
      const lastMerged = merged[merged.length - 1];
      
      if (lastMerged && this.slotsOverlap(lastMerged, slot)) {
        // Merge with previous slot
        lastMerged.endTime = new Date(Math.max(
          lastMerged.endTime.getTime(),
          slot.endTime.getTime()
        ));
        lastMerged.userIds = [...new Set([...lastMerged.userIds, slot.userId])];
      } else {
        // Add new merged slot
        merged.push({
          userIds: [slot.userId],
          startTime: slot.startTime,
          endTime: slot.endTime,
          eventIds: [slot.eventId],
          titles: [slot.title]
        });
      }
    }
    
    return merged;
  }
  
  private findFreeSlotsInDay(
    dayStart: Date,
    dayEnd: Date,
    busySlots: BusySlot[],
    duration: number
  ): TimeSlot[] {
    const freeSlots: TimeSlot[] = [];
    let currentTime = new Date(dayStart);
    
    while (currentTime.getTime() + duration <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration);
      
      // Check if this slot conflicts with any busy slot
      const hasConflict = busySlots.some(busy => 
        this.slotsOverlap(
          { startTime: currentTime, endTime: slotEnd },
          { startTime: busy.startTime, endTime: busy.endTime }
        )
      );
      
      if (!hasConflict) {
        freeSlots.push({
          startTime: new Date(currentTime),
          endTime: slotEnd,
          confidence: this.calculateConfidence(currentTime, busySlots),
          attendees: this.getAvailableAttendees(currentTime, slotEnd, busySlots)
        });
        
        // Move to next potential slot
        currentTime = new Date(currentTime.getTime() + duration * 1000);
      } else {
        // Jump to end of conflicting slot
        const conflictingSlot = busySlots.find(busy => 
          this.slotsOverlap(
            { startTime: currentTime, endTime: slotEnd },
            { startTime: busy.startTime, endTime: busy.endTime }
          )
        );
        
        if (conflictingSlot) {
          currentTime = new Date(conflictingSlot.endTime);
        }
      }
    }
    
    return freeSlots;
  }
  
  private slotsOverlap(slot1: { startTime: Date; endTime: Date }, slot2: { startTime: Date; endTime: Date }): boolean {
    return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
  }
  
  private calculateConfidence(slotStart: Date, busySlots: BusySlot[]): number {
    // Higher confidence for slots further in the future
    const daysFromNow = (slotStart.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    const timeConfidence = Math.min(1, daysFromNow / 7); // Max confidence at 7 days
    
    // Lower confidence for slots near existing events
    const nearbyEvents = busySlots.filter(busy => {
      const timeDiff = Math.abs(busy.startTime.getTime() - slotStart.getTime());
      return timeDiff < 60 * 60 * 1000; // Within 1 hour
    });
    const eventConfidence = Math.max(0, 1 - (nearbyEvents.length * 0.2));
    
    return (timeConfidence + eventConfidence) / 2;
  }
  
  private getAvailableAttendees(
    startTime: Date,
    endTime: Date,
    busySlots: BusySlot[]
  ): string[] {
    const allAttendees = new Set<string>();
    const unavailableAttendees = new Set<string>();
    
    // Collect all attendees
    for (const busy of busySlots) {
      allAttendees.add(busy.userId);
    }
    
    // Find unavailable attendees
    for (const busy of busySlots) {
      if (this.slotsOverlap(
        { startTime, endTime },
        { startTime: busy.startTime, endTime: busy.endTime }
      )) {
        unavailableAttendees.add(busy.userId);
      }
    }
    
    // Return available attendees
    return Array.from(allAttendees).filter(id => !unavailableAttendees.has(id));
  }
  
  private rankTimeSlots(slots: TimeSlot[], constraints: SchedulingConstraints): TimeSlot[] {
    return slots.sort((a, b) => {
      // Sort by confidence (higher first)
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Sort by number of available attendees (more first)
      if (a.attendees.length !== b.attendees.length) {
        return b.attendees.length - a.attendees.length;
      }
      
      // Sort by preferred time of day
      if (constraints.preferredTime) {
        const aHour = a.startTime.getHours();
        const bHour = b.startTime.getHours();
        const aDiff = Math.abs(aHour - constraints.preferredTime);
        const bDiff = Math.abs(bHour - constraints.preferredTime);
        
        if (aDiff !== bDiff) {
          return aDiff - bDiff;
        }
      }
      
      // Sort by start time (earlier first)
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }
  
  private generateSuggestions(
    slots: TimeSlot[],
    constraints: SchedulingConstraints
  ): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = [];
    
    // Top 3 suggestions
    const topSlots = slots.slice(0, 3);
    
    for (const slot of topSlots) {
      const suggestion: SchedulingSuggestion = {
        startTime: slot.startTime,
        endTime: slot.endTime,
        confidence: slot.confidence,
        availableAttendees: slot.attendees,
        unavailableAttendees: this.getUnavailableAttendees(slot, constraints),
        reasoning: this.generateReasoning(slot, constraints),
        alternatives: this.findAlternatives(slot, slots, constraints)
      };
      
      suggestions.push(suggestion);
    }
    
    return suggestions;
  }
  
  private generateReasoning(slot: TimeSlot, constraints: SchedulingConstraints): string {
    const reasons: string[] = [];
    
    if (slot.confidence > 0.8) {
      reasons.push('High confidence - far in advance');
    }
    
    if (slot.attendees.length === constraints.attendeeIds?.length) {
      reasons.push('All attendees available');
    }
    
    const hour = slot.startTime.getHours();
    if (hour >= 10 && hour <= 14) {
      reasons.push('Optimal meeting time');
    }
    
    if (hour >= 9 && hour <= 17) {
      reasons.push('Within business hours');
    }
    
    return reasons.join(', ');
  }
  
  private findAlternatives(
    slot: TimeSlot,
    allSlots: TimeSlot[],
    constraints: SchedulingConstraints
  ): TimeSlot[] {
    // Find similar slots nearby
    return allSlots
      .filter(s => s !== slot)
      .filter(s => Math.abs(s.startTime.getTime() - slot.startTime.getTime()) < 2 * 60 * 60 * 1000) // Within 2 hours
      .slice(0, 2);
  }
}
```

---

## 📋 SCHEDULING WORKFLOW

### Meeting Scheduler
```typescript
class MeetingScheduler {
  private availabilityChecker: MultiUserAvailabilityChecker;
  
  constructor() {
    this.availabilityChecker = new MultiUserAvailabilityChecker();
  }
  
  async scheduleMeeting(request: ScheduleMeetingRequest): Promise<ScheduleMeetingResponse> {
    const {
      title,
      description,
      attendeeIds,
      duration,
      dateRange,
      timezone,
      constraints
    } = request;
    
    // 1. Get calendar accounts
    const calendarAccounts = await this.availabilityChecker.getCalendarAccountsForUsers(attendeeIds);
    
    // 2. Identify which calendars belong to which people
    const calendarOwnership = this.identifyCalendarOwnership(calendarAccounts, attendeeIds);
    
    // 3. Get calendar events for relevant date range
    const events = await this.availabilityChecker.fetchEventsForAttendees(
      calendarAccounts,
      dateRange,
      timezone
    );
    
    // 4. Analyze events to find free time slots
    const availability = await this.availabilityChecker.findAvailableTimeSlots({
      attendeeIds,
      duration,
      dateRange,
      timezone,
      constraints
    });
    
    // 5. Present suggested times in user's timezone
    const suggestions = this.formatSuggestions(availability.availableSlots, timezone);
    
    return {
      suggestions,
      attendeeAvailability: availability.attendeeAvailability,
      conflicts: availability.conflicts,
      calendarOwnership,
      nextSteps: this.generateNextSteps(suggestions)
    };
  }
  
  async bookMeeting(booking: BookingRequest): Promise<BookingResponse> {
    const {
      selectedSlot,
      attendeeIds,
      meetingDetails,
      calendarId
    } = booking;
    
    try {
      // 1. Verify slot is still available
      const isStillAvailable = await this.verifySlotAvailability(selectedSlot, attendeeIds);
      if (!isStillAvailable) {
        return {
          success: false,
          error: 'Selected time slot is no longer available',
          alternatives: await this.getAlternativeSlots(selectedSlot, attendeeIds)
        };
      }
      
      // 2. Create event in primary calendar
      const event = await this.createCalendarEvent({
        ...meetingDetails,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        attendeeIds,
        calendarId
      });
      
      // 3. Send invitations to other attendees
      await this.sendInvitations(event, attendeeIds);
      
      // 4. Update all relevant calendars
      await this.syncToAllCalendars(event, attendeeIds);
      
      return {
        success: true,
        event,
        calendarUpdates: await this.getCalendarUpdates(event, attendeeIds)
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to book meeting: ${error}`
      };
    }
  }
  
  private identifyCalendarOwnership(
    calendarAccounts: Map<string, Calendar[]>,
    attendeeIds: string[]
  ): CalendarOwnership {
    const ownership: CalendarOwnership = {
      userCalendars: new Map(),
      sharedCalendars: [],
      conflicts: []
    };
    
    for (const [userId, calendars] of calendarAccounts) {
      const userCalendars = calendars.filter(cal => cal.owner === userId);
      const sharedCalendars = calendars.filter(cal => cal.owner !== userId);
      
      ownership.userCalendars.set(userId, userCalendars);
      ownership.sharedCalendars.push(...sharedCalendars);
    }
    
    return ownership;
  }
  
  private formatSuggestions(slots: TimeSlot[], timezone: string): FormattedSuggestion[] {
    return slots.map(slot => ({
      startTime: this.formatTime(slot.startTime, timezone),
      endTime: this.formatTime(slot.endTime, timezone),
      date: this.formatDate(slot.startTime, timezone),
      confidence: slot.confidence,
      availableAttendees: slot.attendees,
      reasoning: this.generateHumanReadableReasoning(slot)
    }));
  }
  
  private formatTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone
    }).format(date);
  }
  
  private formatDate(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    }).format(date);
  }
  
  private generateHumanReadableReasoning(slot: TimeSlot): string {
    const reasons: string[] = [];
    
    if (slot.confidence > 0.8) {
      reasons.push('High confidence timing');
    }
    
    const hour = slot.startTime.getHours();
    if (hour >= 10 && hour <= 14) {
      reasons.push('Optimal meeting time');
    }
    
    if (slot.attendees.length > 1) {
      reasons.push(`${slot.attendees.length} people available`);
    }
    
    return reasons.join('. ');
  }
  
  private generateNextSteps(suggestions: FormattedSuggestion[]): string[] {
    const steps: string[] = [];
    
    if (suggestions.length > 0) {
      steps.push('Review the suggested time slots above');
      steps.push('Select a time that works for everyone');
      steps.push('Confirm the meeting details');
      steps.push('Send invitations to all attendees');
    } else {
      steps.push('No suitable time slots found');
      steps.push('Try expanding the date range');
      steps.push('Consider reducing the meeting duration');
      steps.push('Check if some attendees have optional attendance');
    }
    
    return steps;
  }
}
```

---

## 🔄 REAL-TIME SYNC

### Calendar Sync Manager
```typescript
class CalendarSyncManager {
  private syncIntervals = new Map<string, NodeJS.Timeout>();
  private eventListeners = new Map<string, Set<(events: Event[]) => void>>();
  
  async enableRealTimeSync(calendarId: string, interval: number = 60): Promise<void> {
    // Clear existing interval
    if (this.syncIntervals.has(calendarId)) {
      clearInterval(this.syncIntervals.get(calendarId));
    }
    
    // Set up new sync interval
    const syncInterval = setInterval(async () => {
      await this.syncCalendar(calendarId);
    }, interval * 1000);
    
    this.syncIntervals.set(calendarId, syncInterval);
    
    // Initial sync
    await this.syncCalendar(calendarId);
  }
  
  async disableRealTimeSync(calendarId: string): Promise<void> {
    const interval = this.syncIntervals.get(calendarId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(calendarId);
    }
  }
  
  subscribeToCalendarChanges(
    calendarId: string,
    callback: (events: Event[]) => void
  ): () => void {
    if (!this.eventListeners.has(calendarId)) {
      this.eventListeners.set(calendarId, new Set());
    }
    
    this.eventListeners.get(calendarId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(calendarId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(calendarId);
        }
      }
    };
  }
  
  private async syncCalendar(calendarId: string): Promise<void> {
    try {
      const provider = this.getCalendarProvider(calendarId);
      const lastSync = await this.getLastSyncTime(calendarId);
      
      // Get events since last sync
      const events = await provider.getEvents(
        calendarId,
        lastSync,
        new Date()
      );
      
      if (events.length > 0) {
        // Update local cache
        await this.updateLocalEvents(calendarId, events);
        
        // Notify listeners
        const listeners = this.eventListeners.get(calendarId);
        if (listeners) {
          listeners.forEach(callback => callback(events));
        }
        
        // Update last sync time
        await this.updateLastSyncTime(calendarId);
      }
    } catch (error) {
      console.error(`Failed to sync calendar ${calendarId}:`, error);
    }
  }
  
  private async updateLocalEvents(calendarId: string, events: Event[]): Promise<void> {
    for (const event of events) {
      await indexedDB.storeEvent(event);
    }
    
    // Update Redux store
    store.dispatch(fetchEvents.fulfilled(events));
  }
}
```

---

## 🚀 NEXT STEPS

With calendar and coordination implemented:

1. **Phase 8:** Feedback & Iteration

**The application now has comprehensive calendar coordination with multi-user scheduling.**
