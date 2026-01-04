import type { AnalyticsEvent } from "../core/types.js";

export type EventType = AnalyticsEvent["type"];
export type EventHandler<E extends EventType> = (event: Extract<AnalyticsEvent, { type: E }>) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<EventType, Array<(e: any) => any>>();
  private middlewares: Array<(event: AnalyticsEvent) => Promise<void>> = [];

  on<E extends EventType>(type: E, handler: EventHandler<E>): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as any);
    this.handlers.set(type, list);
  }

  off<E extends EventType>(type: E, handler: EventHandler<E>): void {
    const list = this.handlers.get(type) ?? [];
    const index = list.indexOf(handler as any);
    if (index > -1) {
      list.splice(index, 1);
      this.handlers.set(type, list);
    }
  }

  addMiddleware(middleware: (event: AnalyticsEvent) => Promise<void>): void {
    this.middlewares.push(middleware);
  }

  async emit(event: AnalyticsEvent): Promise<void> {
    // Run middlewares first
    for (const middleware of this.middlewares) {
      await middleware(event);
    }

    // Then run handlers
    const list = this.handlers.get(event.type) ?? [];
    for (const handler of list) {
      try {
        await handler(event as any);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  once<E extends EventType>(type: E, handler: EventHandler<E>): void {
    const onceHandler = (event: Extract<AnalyticsEvent, { type: E }>) => {
      handler(event);
      this.off(type, onceHandler as any);
    };
    this.on(type, onceHandler as any);
  }

  removeAllListeners(type?: EventType): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  listenerCount(type: EventType): number {
    return this.handlers.get(type)?.length || 0;
  }

  eventNames(): EventType[] {
    return Array.from(this.handlers.keys());
  }
}
