import type { Event } from "../modules/events.js";

export type MetricPoint = { name: string; atUtc: string; value: number; tags?: Record<string, string> };

export class AnalyticsSink {
  private events: Event[] = [];
  private metrics: MetricPoint[] = [];

  trackEvent(e: Event) { this.events.push(e); }
  trackMetric(m: MetricPoint) { this.metrics.push(m); }

  getEvents() { return this.events.slice(); }
  getMetrics() { return this.metrics.slice(); }
  count(type: Event["type"]) { return this.events.filter(e => e.type === type).length; }
}
