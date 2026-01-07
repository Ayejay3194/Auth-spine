export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public meta?: Record<string, unknown>
  ) {
    super(message);
  }
}
