export type ParsedIntent =
  | { kind: "BOOK_REQUEST" }
  | { kind: "BOOK_SAME_AS_LAST_TIME" }
  | { kind: "RESET" }
  | { kind: "UNKNOWN" };

export function parseSmsIntent(body: string): ParsedIntent {
  const t = body.trim().toLowerCase();
  if (t === "reset" || t === "start over") return { kind: "RESET" };
  if (t.includes("same as last")) return { kind: "BOOK_SAME_AS_LAST_TIME" };
  if (t.includes("book") || t.includes("i want") || t.includes("need") || t.includes("schedule")) return { kind: "BOOK_REQUEST" };
  if (/(hair|nail|massage|trainer|tutor|tax|consult|clean)/.test(t)) return { kind: "BOOK_REQUEST" };
  return { kind: "UNKNOWN" };
}
