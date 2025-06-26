class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomError {}
class ValidationError extends CustomError {}
class UnauthorizedError extends CustomError {}

module.exports = {
  CustomError,
  NotFoundError,
  ValidationError,
  UnauthorizedError
};