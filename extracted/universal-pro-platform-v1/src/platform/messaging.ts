import type { OutboundMessage, MessageChannel, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export class MessagingService {
  private kv = new MemoryKV<OutboundMessage>();

  send(toClientId: ID, channel: MessageChannel, text: string, atUtc: string): OutboundMessage {
    const m: OutboundMessage = { id: id("msg"), toClientId, channel, text, createdAtUtc: atUtc };
    this.kv.set(m);
    return m;
  }

  outbox() { return this.kv.values(); }
}
