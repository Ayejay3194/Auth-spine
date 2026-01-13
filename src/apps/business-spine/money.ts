
export function fmt(cents: number) {
  return `$${(cents/100).toFixed(2)}`;
}
