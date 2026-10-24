/**
 * Custom operational error with an HTTP status code.
 * Throw this in services/controllers for expected failures
 * (e.g. "user not found", "invalid credentials").
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
