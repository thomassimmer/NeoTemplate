/**
 * Authentication use cases - application logic for authentication operations.
 */

import { AuthTokens, User } from '@/src/domain/entities';
import {
  AuthenticationException,
  EmailServiceException,
  ValidationException,
} from '@/src/domain/exceptions';
import { Email, Password } from '@/src/domain/value-objects';
import { IApiClient } from '@/src/domain/interfaces/api-client.interface';
import { IAuthService } from '@/src/domain/interfaces/auth-service.interface';

/**
 * Login result with optional verification requirement.
 */
export interface LoginResult {
  user: User;
  tokens: AuthTokens;
  requiresVerification?: boolean;
}

/**
 * Registration result.
 */
export interface RegistrationResult {
  user?: User;
  tokens?: AuthTokens;
  requiresEmailVerification: boolean;
  message?: string;
}

/**
 * Authentication use cases.
 */
export class AuthUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly apiClient: IApiClient
  ) {}

  /**
   * Login with email and password.
   *
   * @param email - User email
   * @param password - User password
   * @returns Login result with user and tokens
   * @throws {ValidationException} If credentials are invalid
   * @throws {AuthenticationException} If authentication fails
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const emailValue = new Email(email);
      const passwordValue = new Password(password);

      const result = await this.authService.login({
        email: emailValue,
        password: passwordValue,
      });

      return {
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException
      ) {
        throw error;
      }
      throw new AuthenticationException(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Register a new user.
   *
   * @param email - User email
   * @param password - User password
   * @param passwordConfirmation - Password confirmation
   * @returns Registration result
   * @throws {ValidationException} If registration data is invalid
   * @throws {EmailServiceException} If email verification cannot be sent
   */
  async register(
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<RegistrationResult> {
    try {
      const emailValue = new Email(email);
      const passwordValue = new Password(password);
      const passwordConfirmationValue = new Password(passwordConfirmation);

      // Validate password match
      if (passwordValue.value !== passwordConfirmationValue.value) {
        throw new ValidationException('Passwords do not match', {
          password1: ['Passwords do not match'],
        });
      }

      const result = await this.authService.register({
        email: emailValue,
        password: passwordValue,
        passwordConfirmation: passwordConfirmationValue,
      });

      if (!result) {
        // Registration requires email verification
        return {
          requiresEmailVerification: true,
          message:
            'A email was sent to verify your address. You need to open it and click on the link inside to connect.',
        };
      }

      return {
        user: result.user,
        tokens: result.tokens,
        requiresEmailVerification: false,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof EmailServiceException
      ) {
        throw error;
      }
      throw new AuthenticationException(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Logout the current user.
   */
  async logout(): Promise<void> {
    await this.authService.logout();
  }

  /**
   * Get the current authenticated user.
   *
   * @returns User if authenticated, null otherwise
   */
  async getCurrentUser(): Promise<User | null> {
    return this.authService.getCurrentUser();
  }

  /**
   * Check if user is authenticated.
   *
   * @returns True if authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    return this.authService.isAuthenticated();
  }

  /**
   * Refresh authentication token.
   *
   * @param refreshToken - Refresh token
   * @returns New access token
   * @throws {AuthenticationException} If token refresh fails
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.authService.refreshToken(refreshToken);
  }

  /**
   * Resend email verification link.
   *
   * @param email - User email
   * @throws {ValidationException} If email is invalid
   * @throws {EmailServiceException} If email cannot be sent
   */
  async resendEmailVerification(email: string): Promise<void> {
    try {
      const emailValue = new Email(email);

      await this.apiClient.post(
        '/api/auth/registration/resend-email/',
        {
          email: emailValue.value,
        },
        {
          withCredentials: true, // Necessary to pass csrf token
        }
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Email verification resend failed',
          error.errors as Record<string, string[]>
        );
      }
      throw new EmailServiceException(
        `Failed to resend verification email: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Request password reset email.
   *
   * @param email - User email
   * @throws {ValidationException} If email is invalid
   * @throws {EmailServiceException} If email cannot be sent
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const emailValue = new Email(email);

      await this.apiClient.post(
        '/api/auth/password/reset/',
        {
          email: emailValue.value,
        },
        {
          withCredentials: true, // Necessary to pass csrf token
        }
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 429
      ) {
        throw new ValidationException('Too many requests', {
          nonFieldErrors: [
            'Please wait a few minutes before asking for a new email.',
          ],
        });
      }
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Password reset request failed',
          error.errors as Record<string, string[]>
        );
      }
      throw new EmailServiceException(
        `Failed to send password reset email: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Confirm password reset with new password.
   *
   * @param uid - User ID from reset link
   * @param token - Reset token from reset link
   * @param newPassword1 - New password
   * @param newPassword2 - New password confirmation
   * @throws {ValidationException} If passwords don't match or are invalid
   * @throws {AuthenticationException} If reset token is invalid
   */
  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword1: string,
    newPassword2: string
  ): Promise<void> {
    try {
      const password1 = new Password(newPassword1);
      const password2 = new Password(newPassword2);

      // Validate passwords match
      if (password1.value !== password2.value) {
        throw new ValidationException('Passwords do not match', {
          newPassword2: ['Passwords do not match'],
        });
      }

      await this.apiClient.post(
        '/api/auth/password/reset/confirm/',
        {
          uid,
          token,
          new_password1: password1.value,
          new_password2: password2.value,
        },
        {
          withCredentials: true, // Necessary to pass csrf token
        }
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 429
      ) {
        throw new ValidationException('Too many requests', {
          nonFieldErrors: [
            'Please wait a few minutes before asking for a new email.',
          ],
        });
      }
      if (error instanceof ValidationException) {
        throw error;
      }
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Password reset confirmation failed',
          error.errors as Record<string, string[]>
        );
      }
      throw new AuthenticationException(
        `Password reset failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Confirm email verification.
   *
   * @param key - Email verification key
   * @throws {ValidationException} If key is invalid
   * @throws {AuthenticationException} If verification fails
   */
  async confirmEmail(key: string): Promise<void> {
    try {
      if (!key || !key.trim()) {
        throw new ValidationException('Verification key is required', {
          nonFieldErrors: ['Verification key cannot be empty'],
        });
      }

      await this.apiClient.get(`/api/accounts/confirm-email/${key}/`);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Email verification failed',
          error.errors as Record<string, string[]>
        );
      }
      throw new AuthenticationException(
        `Email verification failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

