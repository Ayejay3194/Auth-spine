export interface Observation {
  input: string;
  context?: Record<string, any>;
}

export function observe(input: string, context?: Record<string, any>): Observation {
  return { input, context };
}
