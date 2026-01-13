/**
 * Metrics Collector for Auth-spine Analytics
 * Handles event tracking, metric recording, and data aggregation
 */

import { Logger } from './logger.js';
import { AnalyticsEvent, MetricSnapshot, AnalyticsConfig } from './types.js';

export interface MetricsConfig {
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
  compressionEnabled: boolean;
}

export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max' | 'latest' | 'rate';
export type TimeWindow = '1h' | '24h' | '7d' | '30d' | '90d' | '1y';

export interface MetricDefinition {
  name: string;
  description: string;
  type: 'currency' | 'count' | 'percentage' | 'duration' | 'score' | 'number';
  aggregation: AggregationType;
  category: 'financial' | 'hr' | 'operations' | 'security' | 'performance';
  unit?: string;
  format?: string;
}

export class MetricsCollector {
  private config: AnalyticsConfig;
  private metricsConfig: MetricsConfig;
  private logger: Logger;
  private eventBuffer: AnalyticsEvent[] = [];
  private snapshotBuffer: MetricSnapshot[] = [];
  private flushTimer?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  // In-memory storage for demo purposes
  // In production, this would connect to a database
  private events: AnalyticsEvent[] = [];
  private snapshots: MetricSnapshot[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.metricsConfig = {
      batchSize: 100,
      flushInterval: 30000, // 30 seconds
      retryAttempts: 3,
      compressionEnabled: true
    };
    
    this.logger = new Logger({ 
      level: 'info', 
      format: 'json',
      service: 'metrics-collector'
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing Metrics Collector...');
      
      // Setup batch processing
      this.setupBatchProcessing();
      
      // Load existing metric definitions
      await this.loadMetricDefinitions();
      
      this.isInitialized = true;
      this.logger.info('Metrics Collector initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Metrics Collector', error);
      throw error;
    }
  }

  /**
   * Record analytics event
   */
  async recordEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      // Add to buffer for batch processing
      this.eventBuffer.push(event);
      
      // Flush if buffer is full
      if (this.eventBuffer.length >= this.metricsConfig.batchSize) {
        await this.flushEvents();
      }
      
      this.logger.debug('Event added to buffer', { 
        event: event.event, 
        bufferSize: this.eventBuffer.length 
      });
      
    } catch (error) {
      this.logger.error('Failed to record event', error);
    }
  }

  /**
   * Record metric snapshot
   */
  async recordSnapshot(snapshot: MetricSnapshot): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      // Add to buffer for batch processing
      this.snapshotBuffer.push(snapshot);
      
      // Flush if buffer is full
      if (this.snapshotBuffer.length >= this.metricsConfig.batchSize) {
        await this.flushSnapshots();
      }
      
      this.logger.debug('Snapshot added to buffer', { 
        metric: snapshot.metric, 
        bufferSize: this.snapshotBuffer.length 
      });
      
    } catch (error) {
      this.logger.error('Failed to record snapshot', error);
    }
  }

  /**
   * Get latest value for a metric
   */
  async getLatestValue(metric: string, dimensions?: any): Promise<number | null> {
    try {
      const snapshots = this.snapshots
        .filter(s => s.metric === metric)
        .filter(s => !dimensions || JSON.stringify(s.dims) === JSON.stringify(dimensions))
        .sort((a, b) => b.asOfDate.getTime() - a.asOfDate.getTime());
      
      return snapshots.length > 0 ? 
        (snapshots[0].valueNumber ?? snapshots[0].valueCents ?? 0) : null;
        
    } catch (error) {
      this.logger.error('Failed to get latest value', error);
      return null;
    }
  }

  /**
   * Get previous value for a metric
   */
  async getPreviousValue(metric: string, timeWindow?: string, dimensions?: any): Promise<number | null> {
    try {
      const days = this.getTimeWindowDays(timeWindow);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const snapshots = this.snapshots
        .filter(s => s.metric === metric)
        .filter(s => s.asOfDate < cutoffDate)
        .filter(s => !dimensions || JSON.stringify(s.dims) === JSON.stringify(dimensions))
        .sort((a, b) => b.asOfDate.getTime() - a.asOfDate.getTime());
      
      return snapshots.length > 0 ? 
        (snapshots[0].valueNumber ?? snapshots[0].valueCents ?? 0) : null;
        
    } catch (error) {
      this.logger.error('Failed to get previous value', error);
      return null;
    }
  }

  /**
   * Query events with filters
   */
  async queryEvents(filters: {
    event?: string;
    entity?: string;
    actorEmail?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AnalyticsEvent[]> {
    try {
      let filteredEvents = [...this.events];
      
      if (filters.event) {
        filteredEvents = filteredEvents.filter(e => e.event === filters.event);
      }
      
      if (filters.entity) {
        filteredEvents = filteredEvents.filter(e => e.entity === filters.entity);
      }
      
      if (filters.actorEmail) {
        filteredEvents = filteredEvents.filter(e => e.actorEmail === filters.actorEmail);
      }
      
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(e => e.occurredAt >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(e => e.occurredAt <= filters.endDate!);
      }
      
      // Sort by most recent
      filteredEvents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
      
      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 100;
      
      return filteredEvents.slice(offset, offset + limit);
      
    } catch (error) {
      this.logger.error('Failed to query events', error);
      return [];
    }
  }

  /**
   * Get metric history
   */
  async getMetricHistory(
    metric: string, 
    startDate: Date, 
    endDate: Date,
    dimensions?: any
  ): Promise<MetricSnapshot[]> {
    try {
      return this.snapshots
        .filter(s => s.metric === metric)
        .filter(s => s.asOfDate >= startDate && s.asOfDate <= endDate)
        .filter(s => !dimensions || JSON.stringify(s.dims) === JSON.stringify(dimensions))
        .sort((a, b) => a.asOfDate.getTime() - b.asOfDate.getTime());
        
    } catch (error) {
      this.logger.error('Failed to get metric history', error);
      return [];
    }
  }

  /**
   * Compute daily snapshots
   */
  async computeDailySnapshots(days: number): Promise<void> {
    try {
      this.logger.info('Computing daily snapshots', { days });
      
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      for (let i = 0; i < days; i++) {
        const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
        
        // Compute various metrics for this day
        await this.computeDailyMetrics(day, nextDay);
      }
      
      this.logger.info('Daily snapshots computed successfully');
      
    } catch (error) {
      this.logger.error('Failed to compute daily snapshots', error);
      throw error;
    }
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(): Promise<{
    eventsProcessed: number;
    snapshotsGenerated: number;
    errorRate: number;
    lastFlush: Date;
  }> {
    return {
      eventsProcessed: this.events.length,
      snapshotsGenerated: this.snapshots.length,
      errorRate: 0, // Simplified for demo
      lastFlush: new Date()
    };
  }

  /**
   * Force flush buffers
   */
  async flush(): Promise<void> {
    await Promise.all([
      this.flushEvents(),
      this.flushSnapshots()
    ]);
  }

  // Private helper methods

  private setupBatchProcessing(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        this.logger.error('Failed to flush buffers', error);
      });
    }, this.metricsConfig.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    try {
      const eventsToFlush = [...this.eventBuffer];
      this.eventBuffer = [];
      
      // In production, this would write to database
      this.events.push(...eventsToFlush);
      
      this.logger.debug('Events flushed', { count: eventsToFlush.length });
      
    } catch (error) {
      this.logger.error('Failed to flush events', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...this.eventBuffer);
    }
  }

  private async flushSnapshots(): Promise<void> {
    if (this.snapshotBuffer.length === 0) {
      return;
    }

    try {
      const snapshotsToFlush = [...this.snapshotBuffer];
      this.snapshotBuffer = [];
      
      // In production, this would write to database
      this.snapshots.push(...snapshotsToFlush);
      
      this.logger.debug('Snapshots flushed', { count: snapshotsToFlush.length });
      
    } catch (error) {
      this.logger.error('Failed to flush snapshots', error);
      // Re-add snapshots to buffer for retry
      this.snapshotBuffer.unshift(...this.snapshotBuffer);
    }
  }

  private async loadMetricDefinitions(): Promise<void> {
    // Load predefined metric definitions
    this.logger.debug('Loading metric definitions');
  }

  private getTimeWindowDays(timeWindow?: string): number {
    const windows: Record<string, number> = {
      '1h': 0.0417, // 1 hour
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    return windows[timeWindow || '24h'] || 1;
  }

  private async computeDailyMetrics(day: Date, nextDay: Date): Promise<void> {
    try {
      // Count events for the day
      const dayEvents = this.events.filter(e => 
        e.occurredAt >= day && e.occurredAt < nextDay
      );
      
      const eventCount = dayEvents.length;
      
      // Record daily metrics
      await this.recordSnapshot({
        id: `daily_events_${day.getTime()}`,
        asOfDate: day,
        metric: 'events_daily',
        valueNumber: eventCount,
        createdAt: new Date()
      });
      
      // Compute other metrics based on business logic
      // This would include financial, HR, operations metrics
      
    } catch (error) {
      this.logger.error('Failed to compute daily metrics', error);
    }
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flush();
    this.logger.info('Metrics Collector cleaned up');
  }
}
