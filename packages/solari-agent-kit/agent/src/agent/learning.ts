/**
 * Create training rows from failures.
 * Output format: chat JSONL (messages[]).
 */
export function toLearningRow(args: {
  system: string;
  user: string;
  assistantBad: string;
  assistantGood: string;
  meta?: any;
}) {
  return {
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
      { role: "assistant", content: args.assistantBad },
      { role: "user", content: "The previous answer was invalid. Fix it. Return JSON only." },
      { role: "assistant", content: args.assistantGood }
    ],
    meta: args.meta ?? {}
  };
}
