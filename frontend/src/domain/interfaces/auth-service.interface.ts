/**
 * Authentication service interface (port).
 * Defines the contract for authentication operations.
 */

import { Email, Password } from '../value-objects';
import { AuthTokens, User } from '../entities';
import { ValidationException } from '../exceptions';

/**
 * Login credentials.
 */
export interface LoginCredentials {
  email: Email;
  password: Password;
}

/**
 * Registration credentials.
 */
export interface RegistrationCredentials {
  email: Email;
  password: Password;
  passwordConfirmation: Password;
}

/**
 * Authentication result.
 */
export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

/**
 * Authentication service interface.
 * All authentication operations should go through this interface.
 */
export interface IAuthService {
  /**
   * Login with email and password.
   * @throws {AuthenticationException} If authentication fails
   * @throws {ValidationException} If credentials are invalid
   */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /**
   * Register a new user.
   * @throws {ValidationException} If registration data is invalid
   * @throws {EmailServiceException} If email verification cannot be sent
   */
  register(credentials: RegistrationCredentials): Promise<AuthResult | void>;

  /**
   * Logout the current user.
   */
  logout(): Promise<void>;

  /**
   * Refresh the authentication token.
   * @throws {AuthenticationException} If token refresh fails
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Get the current authenticated user.
   * @returns User if authenticated, null otherwise
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): Promise<boolean>;
}

