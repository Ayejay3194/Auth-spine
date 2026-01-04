import type { Event } from "../modules/events.js";

export type EventType = Event["type"];
export type EventHandler<E extends EventType> = (event: Extract<Event, { type: E }>) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<EventType, Array<(e: any) => any>>();

  on<E extends EventType>(type: E, handler: EventHandler<E>) {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as any);
    this.handlers.set(type, list);
  }

  async emit(event: Event) {
    const list = this.handlers.get(event.type) ?? [];
    for (const h of list) await h(event as any);
  }
}
