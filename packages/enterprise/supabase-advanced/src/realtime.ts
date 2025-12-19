import type { SupabaseClient } from "./types";

export interface PresenceState {
  user_id: string;
  online_at: string;
  last_seen: string;
  metadata?: Record<string, unknown>;
}

export interface BroadcastPayload {
  type: string;
  data: unknown;
  timestamp: string;
}

/**
 * Subscribe to presence updates for a specific room/channel.
 */
export function subscribeToPresence(
  sb: SupabaseClient,
  channel: string,
  onPresenceChange: (presences: PresenceState[]) => void
) {
  // Mock implementation for development
  const mockChannel = {
    on: (event: string, callback: (data: any) => void) => {
      if (event === "presence" && callback) {
        // Mock presence data
        setTimeout(() => {
          onPresenceChange([{
            user_id: "user-1",
            online_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }]);
        }, 100);
      }
      return mockChannel;
    },
    subscribe: async (callback: (status: string) => void) => {
      if (callback) callback("SUBSCRIBED");
      return mockChannel;
    },
    track: async (data: any) => {
      console.log("Tracking presence:", data);
    }
  };

  return mockChannel;
}

/**
 * Send a broadcast message to a channel.
 */
export async function broadcastMessage(
  sb: SupabaseClient,
  channel: string,
  type: string,
  data: unknown
): Promise<void> {
  const payload: BroadcastPayload = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  console.log("Broadcasting message:", payload);
  // Mock implementation - in production this would use real Supabase realtime
}
