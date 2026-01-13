export function requireScope(scopes: string[]|undefined, required: string) {
  if (!scopes?.includes(required)) throw new Error("INSUFFICIENT_SCOPE");
}
