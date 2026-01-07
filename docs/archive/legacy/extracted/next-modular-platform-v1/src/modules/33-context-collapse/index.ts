import type { Module, ModuleContext, PlatformChannel, ID } from "../../core/types";
import { randId } from "../../lib/util";

type ThreadKey = { userId: ID; artistId: ID };

interface ConversationThread {
  id: ID;
  key: ThreadKey;
  channels: PlatformChannel[];
  lastMessageAt: string;
  lastIntent?: { name: string; confidence: number; payload?: Record<string, unknown> };
}

export class ContextCollapsePreventionEngine implements Module {
  meta = {
    id: "33.context-collapse",
    name: "Context Collapse Prevention Engine",
    version: "1.0.0",
    provides: ["conversation_threading", "intent_resumption", "implicit_prefs"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("message.received", async (e) => {
      const userId = e.subject?.userId;
      const artistId = e.subject?.artistId;
      if (!userId || !artistId) return;

      const thread = await this.getOrCreateThread(ctx, { userId, artistId }, e.channel);
      await ctx.store.set(`thread:${thread.id}`, thread);

      const wfId = await ctx.store.get<string>(`intent:last_workflow:${userId}:${artistId}`);
      if (wfId) {
        const wf = await ctx.workflow.get(wfId);
        if (wf && wf.status === "paused") {
          await ctx.workflow.resume(wfId);
          ctx.logger.info("Resumed interrupted intent", { wfId, userId, artistId });
        }
      }
    });

    ctx.events.subscribe("booking.confirmed", async (e) => {
      const userId = e.subject?.userId;
      const artistId = e.subject?.artistId;
      const when = (e.payload as any)?.startAt as string | undefined;
      if (!userId || !artistId || !when) return;

      const key = `prefs:${userId}:${artistId}:time_pattern`;
      const prev = (await ctx.store.get<Record<string, number>>(key)) ?? {};
      const bucket = this.bucketTime(when);
      prev[bucket] = (prev[bucket] ?? 0) + 1;
      await ctx.store.set(key, prev);
    });
  }

  private async getOrCreateThread(
    ctx: ModuleContext,
    key: ThreadKey,
    channel?: PlatformChannel
  ): Promise<ConversationThread> {
    const idKey = `thread:id:${key.userId}:${key.artistId}`;
    const existingId = await ctx.store.get<string>(idKey);
    if (existingId) {
      const thread = (await ctx.store.get<ConversationThread>(`thread:${existingId}`))!;
      if (channel && !thread.channels.includes(channel)) thread.channels.push(channel);
      thread.lastMessageAt = ctx.now();
      return thread;
    }

    const id = randId("thr");
    const thread: ConversationThread = {
      id,
      key,
      channels: channel ? [channel] : [],
      lastMessageAt: ctx.now(),
    };
    await ctx.store.set(idKey, id);
    return thread;
  }

  private bucketTime(iso: string): string {
    const d = new Date(iso);
    const weekday = d.getUTCDay();
    const hour = d.getUTCHours();
    return `wd${weekday}_h${hour}`;
  }
}
