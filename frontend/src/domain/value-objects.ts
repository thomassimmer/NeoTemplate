/**
 * Value objects for the domain layer.
 * Value objects are immutable and contain validation logic.
 */

import { InvalidEmailException } from './exceptions';

/**
 * Email value object with validation.
 * Immutable and validates email format.
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailException('Email cannot be empty or null');
    }

    const trimmedValue = value.trim();

    if (!trimmedValue || !trimmedValue.includes('@')) {
      throw new InvalidEmailException(`Invalid email format: ${value}`);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      throw new InvalidEmailException(`Invalid email format: ${value}`);
    }

    this._value = trimmedValue;
  }

  /**
   * Get the email value as string.
   */
  get value(): string {
    return this._value;
  }

  /**
   * String representation of email.
   */
  toString(): string {
    return this._value;
  }

  /**
   * Equality check with another email.
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }
}

/**
 * Password value object with validation rules.
 * Immutable and validates password requirements.
 */
export class Password {
  private readonly _value: string;
  private readonly _minLength: number = 8;

  constructor(value: string, minLength: number = 8) {
    if (!value || typeof value !== 'string') {
      throw new Error('Password cannot be empty or null');
    }

    if (value.length < minLength) {
      throw new Error(`Password must be at least ${minLength} characters long`);
    }

    this._value = value;
    this._minLength = minLength;
  }

  /**
   * Get the password value.
   * Note: In production, consider not exposing the raw value.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Get minimum length requirement.
   */
  get minLength(): number {
    return this._minLength;
  }

  /**
   * Check if password meets security requirements.
   */
  isValid(): boolean {
    return this._value.length >= this._minLength;
  }
}

/**
 * Contact message value object.
 * Immutable and validates message content.
 */
export class ContactMessage {
  private readonly _email: Email;
  private readonly _message: string;
  private readonly _maxLength: number = 200;

  constructor(email: Email, message: string, maxLength: number = 200) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message cannot be empty or null');
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      throw new Error('Message cannot be empty or whitespace only');
    }

    if (trimmedMessage.length > maxLength) {
      throw new Error(
        `Message exceeds maximum length of ${maxLength} characters`
      );
    }

    this._email = email;
    this._message = trimmedMessage;
    this._maxLength = maxLength;
  }

  /**
   * Get the email associated with the message.
   */
  get email(): Email {
    return this._email;
  }

  /**
   * Get the message content.
   */
  get message(): string {
    return this._message;
  }

  /**
   * Get the maximum allowed length.
   */
  get maxLength(): number {
    return this._maxLength;
  }
}

