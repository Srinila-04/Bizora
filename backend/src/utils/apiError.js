export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Invalid request', code = 'BAD_REQUEST', details = []) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized access', code = 'UNAUTHORIZED', details = []) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = 'Access forbidden', code = 'FORBIDDEN', details = []) {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND', details = []) {
    return new ApiError(404, message, code, details);
  }

  static conflict(message = 'Conflict occurred', code = 'CONFLICT', details = []) {
    return new ApiError(409, message, code, details);
  }

  static unprocessable(message = 'Validation failed', code = 'VALIDATION_ERROR', details = []) {
    return new ApiError(422, message, code, details);
  }

  static tooManyRequests(message = 'Too many requests, please try again later', code = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(429, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR', details = []) {
    return new ApiError(500, message, code, details);
  }
}

export default ApiError;

