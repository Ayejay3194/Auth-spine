export function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
export function randId(prefix: string) { return `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`; }
