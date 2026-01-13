let counter = 0;

export function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${++counter}`;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
