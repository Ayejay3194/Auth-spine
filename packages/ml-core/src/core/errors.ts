export class MlCoreError extends Error {
  constructor(message: string, public code: string, public meta?: Record<string, unknown>) {
    super(message);
    this.name = "MlCoreError";
  }
}
