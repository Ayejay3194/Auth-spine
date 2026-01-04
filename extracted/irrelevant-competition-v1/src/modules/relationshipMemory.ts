export class RelationshipMemoryEngine {
  private memory = new Map<string, string[]>();
  remember(clientId: string, note: string) {
    const list = this.memory.get(clientId) ?? [];
    list.push(note);
    this.memory.set(clientId, list);
  }
}
