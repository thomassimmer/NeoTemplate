/**
 * Domain exceptions - business logic exceptions.
 */

/**
 * Base exception for domain layer.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainException);
    }
  }
}

/**
 * Raised when a user cannot be found.
 */
export class UserNotFoundException extends DomainException {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundException';
  }
}

/**
 * Raised when an email is invalid.
 */
export class InvalidEmailException extends DomainException {
  constructor(message: string = 'Invalid email format') {
    super(message);
    this.name = 'InvalidEmailException';
  }
}

/**
 * Raised when authentication fails.
 */
export class AuthenticationException extends DomainException {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationException';
  }
}

/**
 * Raised when email service fails.
 */
export class EmailServiceException extends DomainException {
  constructor(message: string = 'Email service error') {
    super(message);
    this.name = 'EmailServiceException';
  }
}

/**
 * Raised when validation fails.
 */
export class ValidationException extends DomainException {
  constructor(message: string = 'Validation failed', public readonly errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationException';
  }
}

