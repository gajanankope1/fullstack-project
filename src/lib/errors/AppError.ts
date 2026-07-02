export class AppError extends Error {
  readonly statusCode: number;
  readonly errors: Record<string, string> | null;

  constructor(
    message: string,
    statusCode = 400,
    errors: Record<string, string> | null = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
