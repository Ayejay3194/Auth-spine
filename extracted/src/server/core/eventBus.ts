export type DomainEvent<TType extends string = string, TPayload = unknown> = {
  type: TType;
  id: string;
  at: string;
  payload: TPayload;
};

export interface EventBus {
  publish<E extends DomainEvent>(event: E): Promise<void>;
  subscribe<TType extends string>(
    type: TType,
    handler: (event: DomainEvent<TType, any>) => Promise<void>
  ): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(e: any) => Promise<void>>>();

  subscribe(type: string, handler: (event: any) => Promise<void>) {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  async publish(event: DomainEvent) {
    const list = this.handlers.get(event.type) ?? [];
    for (const h of list) await h(event);
  }
}
