import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

export type ChannelScope = "public" | "private";

export interface PresenceMeta {
  userId: string;
  name?: string;
  avatarUrl?: string;
  [k: string]: unknown;
}

export function channelName(scope: ChannelScope, name: string) {
  return `${scope}:${name}`;
}

export function subscribeToBroadcast<T>(
  sb: SupabaseClient,
  channel: string,
  event: string,
  onMessage: (payload: T) => void
): RealtimeChannel {
  const ch = sb.channel(channel);
  ch.on("broadcast", { event }, ({ payload }) => {
    onMessage(payload as T);
  });
  ch.subscribe();
  return ch;
}

export function enablePresence(
  ch: RealtimeChannel,
  presenceKey: string,
  meta: PresenceMeta
) {
  ch.on("presence", { event: "sync" }, () => {
    // sync event fires; callers can read ch.presenceState()
  });
  ch.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await ch.track({ ...meta, _ts: Date.now() }, { presence: { key: presenceKey } } as any);
    }
  });
}
