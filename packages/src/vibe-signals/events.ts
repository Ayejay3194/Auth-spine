export type ChatEvent =
  | { kind: "msg"; t: number; speaker: string; text: string }
  | { kind: "latency"; t: number; speaker: string; ms: number };

export type ConversationWindow = {
  events: ChatEvent[];
  nowMs: number;
};
