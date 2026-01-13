import type { AnalyticsEvent, ID } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabaseAnalyticsEvent {
  id: string;
  type: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data: any;
  createdAt: Date;
}

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

export abstract class AnalyticsAdapter {
  abstract track(event: AnalyticsEvent): Promise<void>;
  abstract query(query: AnalyticsQuery): Promise<AnalyticsEvent[]>;
  abstract generateReport(query: AnalyticsQuery): Promise<AnalyticsReport>;
  abstract getEventTypes(): Promise<string[]>;
  abstract getActiveUsers(timeRange?: { startDate: string; endDate: string }): Promise<number>;
  abstract getConversionRate(fromEventType: string, toEventType: string, timeRange?: { startDate: string; endDate: string }): Promise<number>;
  abstract clear(): Promise<void>;
  abstract export(format: "json" | "csv"): Promise<string>;
}

export class PrismaAnalyticsAdapter extends AnalyticsAdapter {
  constructor(private prisma: any) {
    super();
  }

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          type: event.type,
          timestamp: new Date(event.timestamp),
          userId: event.userId,
          sessionId: event.sessionId,
          data: event.data || {}
        }
      });
    } catch (error) {
      throw new AppError('Failed to track event', 'DATABASE_ERROR', 500);
    }
  }

  async query(query: AnalyticsQuery): Promise<AnalyticsEvent[]> {
    try {
      const where: any = {};

      if (query.eventTypes && query.eventTypes.length > 0) {
        where.type = { in: query.eventTypes };
      }

      if (query.userId) {
        where.userId = query.userId;
      }

      if (query.sessionId) {
        where.sessionId = query.sessionId;
      }

      if (query.startDate || query.endDate) {
        where.timestamp = {};
        if (query.startDate) {
          where.timestamp.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.timestamp.lte = new Date(query.endDate);
        }
      }

      const events = await this.prisma.analyticsEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: query.limit || 1000,
        skip: query.offset || 0
      });

      return events.map((event: DatabaseAnalyticsEvent) => this.mapToAnalyticsEvent(event));
    } catch (error) {
      throw new AppError('Failed to query analytics', 'DATABASE_ERROR', 500);
    }
  }

  async generateReport(query: AnalyticsQuery): Promise<AnalyticsReport> {
    try {
      const events = await this.query({ ...query, limit: 10000 });
      
      const eventCounts: Record<string, number> = {};
      const userCounts: Record<string, number> = {};
      const timeSeriesData: AnalyticsReport['timeSeriesData'] = [];

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
    } catch (error) {
      throw new AppError('Failed to generate analytics report', 'DATABASE_ERROR', 500);
    }
  }

  async getEventTypes(): Promise<string[]> {
    try {
      const result = await this.prisma.analyticsEvent.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      });

      return result.map((r: { type: string }) => r.type);
    } catch (error) {
      throw new AppError('Failed to get event types', 'DATABASE_ERROR', 500);
    }
  }

  async getActiveUsers(timeRange?: { startDate: string; endDate: string }): Promise<number> {
    try {
      const where: any = {};
      
      if (timeRange) {
        where.timestamp = {};
        if (timeRange.startDate) {
          where.timestamp.gte = new Date(timeRange.startDate);
        }
        if (timeRange.endDate) {
          where.timestamp.lte = new Date(timeRange.endDate);
        }
      }

      const result = await this.prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where,
        _count: {
          userId: true
        }
      });

      return result.length;
    } catch (error) {
      throw new AppError('Failed to get active users', 'DATABASE_ERROR', 500);
    }
  }

  async getConversionRate(
    fromEventType: string, 
    toEventType: string, 
    timeRange?: { startDate: string; endDate: string }
  ): Promise<number> {
    try {
      const where: any = {
        type: { in: [fromEventType, toEventType] }
      };
      
      if (timeRange) {
        where.timestamp = {};
        if (timeRange.startDate) {
          where.timestamp.gte = new Date(timeRange.startDate);
        }
        if (timeRange.endDate) {
          where.timestamp.lte = new Date(timeRange.endDate);
        }
      }

      const events = await this.prisma.analyticsEvent.groupBy({
        by: ['type'],
        where,
        _count: {
          type: true
        }
      });

      const fromEvents = events.find((e: { type: string }) => e.type === fromEventType)?._count.type || 0;
      const toEvents = events.find((e: { type: string }) => e.type === toEventType)?._count.type || 0;
      
      if (fromEvents === 0) return 0;
      return (toEvents / fromEvents) * 100;
    } catch (error) {
      throw new AppError('Failed to calculate conversion rate', 'DATABASE_ERROR', 500);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.prisma.analyticsEvent.deleteMany({});
    } catch (error) {
      throw new AppError('Failed to clear analytics', 'DATABASE_ERROR', 500);
    }
  }

  async export(format: "json" | "csv" = "json"): Promise<string> {
    try {
      const events = await this.query({ limit: 50000 });
      
      if (format === "csv") {
        const headers = ["id", "type", "timestamp", "userId", "sessionId", "data"];
        const rows = events.map(event => [
          event.id || '',
          event.type,
          event.timestamp,
          event.userId || "",
          event.sessionId || "",
          JSON.stringify(event.data)
        ]);
        
        return [
      headers,
      ...rows.map((row: string[]) => row.join(","))
    ].join("\n");
      }
      
      return JSON.stringify(events, null, 2);
    } catch (error) {
      throw new AppError('Failed to export analytics', 'DATABASE_ERROR', 500);
    }
  }

  private mapToAnalyticsEvent(event: DatabaseAnalyticsEvent): AnalyticsEvent {
    return {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      sessionId: event.sessionId,
      data: event.data
    };
  }
}
