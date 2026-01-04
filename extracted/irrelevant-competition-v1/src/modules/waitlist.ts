export class InvisibleWaitlist {
  private slots = new Map<string, string[]>();
  join(slot: string, clientId: string) {
    const l = this.slots.get(slot) ?? [];
    l.push(clientId);
    this.slots.set(slot, l);
  }
}
