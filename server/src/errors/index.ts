export class ConflictError extends Error {
  public statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  public statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  public statusCode = 400;
  public details: { message: string; path: string }[];

  constructor(message: string, details: { message: string; path: string }[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
