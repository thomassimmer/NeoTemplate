/**
 * Domain entities - core business objects.
 * Entities have identity and can change over time.
 */

/**
 * User entity representing a user in the system.
 * This is a domain entity, not a data transfer object.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly image: string | null = null,
    public readonly firstName?: string,
    public readonly lastName?: string
  ) {
    if (!id) {
      throw new Error('User ID cannot be empty');
    }
    if (!email) {
      throw new Error('User email cannot be empty');
    }
    if (!username) {
      throw new Error('User username cannot be empty');
    }
  }

  /**
   * Get user's display name (first name + last name, or username as fallback).
   */
  get displayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
  }

  /**
   * Check if user has a profile image.
   */
  hasImage(): boolean {
    return this.image !== null && this.image !== '';
  }

  /**
   * Equality check based on user ID.
   */
  equals(other: User): boolean {
    return this.id === other.id;
  }
}

/**
 * Authentication tokens entity.
 */
export class AuthTokens {
  constructor(
    public readonly access: string,
    public readonly refresh: string,
    public readonly expiresIn?: number
  ) {
    if (!access) {
      throw new Error('Access token cannot be empty');
    }
    if (!refresh) {
      throw new Error('Refresh token cannot be empty');
    }
  }

  /**
   * Check if tokens are valid (not empty).
   */
  isValid(): boolean {
    return !!this.access && !!this.refresh;
  }
}

