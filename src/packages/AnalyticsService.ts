import type { AnalyticsEvent, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export interface AnalyticsQuery {
  eventTypes?: string[];
  userId?: ID;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsReport {
  totalEvents: number;
  eventCounts: Record<string, number>;
  userCounts: Record<string, number>;
  timeSeriesData: Array<{
    timestamp: string;
    count: number;
    eventType: string;
  }>;
}

export class AnalyticsService {
  private events = new MemoryKV<AnalyticsEvent>();
  private eventIndex = new Map<string, string[]>(); // eventType -> eventIds
  private userIndex = new Map<ID, string[]>(); // userId -> eventIds
  private sessionIndex = new Map<string, string[]>(); // sessionId -> eventIds

  track(event: AnalyticsEvent): void {
    const eventWithId: AnalyticsEvent = { 
      ...event, 
      id: id("event") as string 
    };
    
    this.events.set(eventWithId);
    
    // Update indexes
    const eventTypeList = this.eventIndex.get(event.type) || [];
    eventTypeList.push(eventWithId.id);
    this.eventIndex.set(event.type, eventTypeList);
    
    if (event.userId) {
      const userList = this.userIndex.get(event.userId) || [];
      userList.push(eventWithId.id);
      this.userIndex.set(event.userId, userList);
    }
    
    if (event.sessionId) {
      const sessionList = this.sessionIndex.get(event.sessionId) || [];
      sessionList.push(eventWithId.id);
      this.sessionIndex.set(event.sessionId, sessionList);
    }
  }

  query(query: AnalyticsQuery): AnalyticsEvent[] {
    let eventIds: string[] = [];

    // Start with all events if no filters
    if (!query.eventTypes && !query.userId && !query.sessionId) {
      eventIds = this.events.values().map(e => e.id as string);
    } else {
      // Apply filters
      if (query.eventTypes) {
        const typeIds = query.eventTypes.flatMap(type => 
          this.eventIndex.get(type) || []
        );
        eventIds = eventIds.length === 0 ? typeIds : 
          eventIds.filter(id => typeIds.includes(id));
      }
      
      if (query.userId) {
        const userIds = this.userIndex.get(query.userId) || [];
        eventIds = eventIds.length === 0 ? userIds : 
          eventIds.filter(id => userIds.includes(id));
      }
      
      if (query.sessionId) {
        const sessionIds = this.sessionIndex.get(query.sessionId) || [];
        eventIds = eventIds.length === 0 ? sessionIds : 
          eventIds.filter(id => sessionIds.includes(id));
      }
    }

    // Get events and apply date/time filters
    let events = eventIds.map(id => this.events.get(id)).filter(Boolean) as AnalyticsEvent[];
    
    if (query.startDate) {
      events = events.filter(e => e.timestamp >= query.startDate!);
    }
    
    if (query.endDate) {
      events = events.filter(e => e.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // Apply pagination
    if (query.offset) {
      events = events.slice(query.offset);
    }
    
    if (query.limit) {
      events = events.slice(0, query.limit);
    }

    return events;
  }

  generateReport(query: AnalyticsQuery): AnalyticsReport {
    const events = this.query({ ...query, limit: 10000 }); // Get more events for reporting
    
    const eventCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const timeSeriesData: AnalyticsReport["timeSeriesData"] = [];

    events.forEach(event => {
      // Count by event type
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
      
      // Count by user
      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }
      
      // Time series data (group by hour)
      const hour = event.timestamp.slice(0, 13); // YYYY-MM-DDTHH
      const existingEntry = timeSeriesData.find(d => d.timestamp === hour && d.eventType === event.type);
      if (existingEntry) {
        existingEntry.count++;
      } else {
        timeSeriesData.push({
          timestamp: hour,
          count: 1,
          eventType: event.type
        });
      }
    });

    // Sort time series data
    timeSeriesData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      totalEvents: events.length,
      eventCounts,
      userCounts,
      timeSeriesData
    };
  }

  getEventTypes(): string[] {
    return Array.from(this.eventIndex.keys());
  }

  getActiveUsers(timeRange?: { startDate: string; endDate: string }): number {
    const query: AnalyticsQuery = {};
    if (timeRange) {
      query.startDate = timeRange.startDate;
      query.endDate = timeRange.endDate;
    }
    
    const events = this.query(query);
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean));
    return uniqueUsers.size;
  }

  getConversionRate(fromEventType: string, toEventType: string, timeRange?: { startDate: string; endDate: string }): number {
    const query: AnalyticsQuery = { eventTypes: [fromEventType, toEventType] };
    if (timeRange) {
      query.startDate = timeRange.startDate;
      query.endDate = timeRange.endDate;
    }
    
    const events = this.query(query);
    const fromEvents = events.filter(e => e.type === fromEventType);
    const toEvents = events.filter(e => e.type === toEventType);
    
    if (fromEvents.length === 0) return 0;
    return (toEvents.length / fromEvents.length) * 100;
  }

  clear(): void {
    this.events.clear();
    this.eventIndex.clear();
    this.userIndex.clear();
    this.sessionIndex.clear();
  }

  // Export data for external analysis
  export(format: "json" | "csv" = "json"): string {
    const events = this.events.values();
    
    if (format === "csv") {
      const headers = ["id", "type", "timestamp", "userId", "sessionId", "data"];
      const rows = events.map(event => [
        event.id,
        event.type,
        event.timestamp,
        event.userId || "",
        event.sessionId || "",
        JSON.stringify(event.data)
      ]);
      
      return [headers, ...rows].map(row => row.join(",")).join("\n");
    }
    
    return JSON.stringify(events, null, 2);
  }
}
