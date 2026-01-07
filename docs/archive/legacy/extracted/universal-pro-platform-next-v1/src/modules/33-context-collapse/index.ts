import type { Module, ModuleContext, PlatformChannel, ID } from "@/core/types";
import { randId } from "@/lib/util";

type ThreadKey = { userId: ID; professionalId: ID };

interface ConversationThread {
  id: ID;
  key: ThreadKey;
  channels: PlatformChannel[];
  lastMessageAt: string;
}

export class ContextCollapsePreventionEngine implements Module {
  meta = { id: "33.context-collapse", name: "Context Collapse Prevention Engine", version: "1.0.0" };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("message.received", async (e) => {
      const userId = e.subject?.userId;
      const professionalId = (e.subject as any)?.professionalId as ID | undefined;
      if (!userId || !professionalId) return;

      const thread = await this.getOrCreateThread(ctx, { userId, professionalId }, e.channel);
      await ctx.store.set(`thread:${thread.id}`, thread);
    });
  }

  private async getOrCreateThread(ctx: ModuleContext, key: ThreadKey, channel?: PlatformChannel): Promise<ConversationThread> {
    const idKey = `thread:id:${key.userId}:${key.professionalId}`;
    const existingId = await ctx.store.get<string>(idKey);
    if (existingId) {
      const thread = (await ctx.store.get<ConversationThread>(`thread:${existingId}`))!;
      if (channel && !thread.channels.includes(channel)) thread.channels.push(channel);
      thread.lastMessageAt = ctx.now();
      return thread;
    }

    const id = randId("thr");
    const thread: ConversationThread = { id, key, channels: channel ? [channel] : [], lastMessageAt: ctx.now() };
    await ctx.store.set(idKey, id);
    return thread;
  }
}
