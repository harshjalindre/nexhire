export class AppError extends Error { statusCode: number; errors?: Record<string, string[]>; constructor(message: string, statusCode = 500, errors?: Record<string, string[]>) { super(message); this.statusCode = statusCode; this.errors = errors; this.name = "AppError"; } }
export class NotFoundError extends AppError { constructor(entity: string) { super(`${entity} not found`, 404); } }
export class UnauthorizedError extends AppError { constructor(message = "Unauthorized") { super(message, 401); } }
export class ForbiddenError extends AppError { constructor(message = "Forbidden") { super(message, 403); } }
export class ValidationError extends AppError { constructor(errors: Record<string, string[]>) { super("Validation failed", 422, errors); } }
export class ConflictError extends AppError { constructor(message: string) { super(message, 409); } }
