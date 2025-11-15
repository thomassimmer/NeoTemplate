/**
 * NextAuth implementation of authentication service adapter.
 */

import { signIn, signOut } from 'next-auth/react';
import { AuthTokens, User } from '@/src/domain/entities';
import {
  AuthenticationException,
  EmailServiceException,
  ValidationException,
} from '@/src/domain/exceptions';
import {
  AuthResult,
  IAuthService,
  LoginCredentials,
  RegistrationCredentials,
} from '@/src/domain/interfaces/auth-service.interface';
import { IApiClient } from '@/src/domain/interfaces/api-client.interface';

/**
 * Session data interface.
 */
export interface SessionData {
  user?: {
    id: string;
    email: string;
    username: string;
    image?: string | null;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    access: string;
    refresh: string;
  };
  error?: string;
}

/**
 * NextAuth-based authentication service implementation.
 * This is a client-side adapter that wraps NextAuth's signIn/signOut.
 *
 * Note: This adapter is designed for use in React components/hooks.
 * For server-side authentication configuration, see the NextAuth route handler.
 */
export class NextAuthAuthService implements IAuthService {
  constructor(
    private readonly apiClient: IApiClient,
    private readonly getSessionData: () => SessionData | null
  ) {}

  /**
   * Convert domain User to NextAuth user format.
   */
  private mapToDomainUser(userData: any): User {
    return new User(
      String(userData.id),
      userData.email,
      userData.username || userData.email,
      userData.image || null,
      userData.firstName || userData.first_name,
      userData.lastName || userData.last_name
    );
  }

  /**
   * Login with email and password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response: any = await signIn('credentials', {
        email: credentials.email.value,
        password: credentials.password.value,
        is_registration: false,
        redirect: false,
      });

      if (response?.error) {
        const errorData = JSON.parse(response.error);
        if (errorData.errors) {
          throw new ValidationException(
            'Login validation failed',
            errorData.errors
          );
        }
        throw new AuthenticationException(response.error);
      }

      // After successful login, session will be updated by NextAuth
      // We need to wait a bit for the session to update, or get it from response
      // For now, we'll get the session data from the getter
      // Note: In practice, you might want to refresh the session or get it differently
      const session = this.getSessionData();
      if (!session?.user) {
        throw new AuthenticationException('Failed to get user session');
      }

      const user = this.mapToDomainUser(session.user);
      const tokens = new AuthTokens(
        session.user.access,
        session.user.refresh
      );

      return { user, tokens };
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
   */
  async register(
    credentials: RegistrationCredentials
  ): Promise<AuthResult | void> {
    try {
      if (credentials.password.value !== credentials.passwordConfirmation.value) {
        throw new ValidationException('Passwords do not match', {
          password1: ['Passwords do not match'],
        });
      }

      const response: any = await signIn('credentials', {
        email: credentials.email.value,
        password: credentials.password.value,
        is_registration: true,
        redirect: false,
      });

      if (response?.error) {
        if (response.error === 'verificationEmailSent') {
          // Registration successful but email verification required
          return;
        }

        const errorData = JSON.parse(response.error);
        if (errorData.errors) {
          throw new ValidationException(
            'Registration validation failed',
            errorData.errors
          );
        }
        throw new EmailServiceException(response.error);
      }

      // After successful registration, session might be updated
      // Check if we have session data
      const session = this.getSessionData();
      if (!session?.user) {
        // Registration might require email verification
        return;
      }

      const user = this.mapToDomainUser(session.user);
      const tokens = new AuthTokens(
        session.user.access,
        session.user.refresh
      );

      return { user, tokens };
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
    await signOut({ redirect: false });
  }

  /**
   * Refresh the authentication token.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await this.apiClient.post<{ access: string }>(
        '/api/auth/token/refresh/',
        { refresh: refreshToken }
      );

      return new AuthTokens(refreshToken, refreshToken); // Note: refresh token might not change
    } catch (error) {
      throw new AuthenticationException('Token refresh failed');
    }
  }

  /**
   * Get the current authenticated user.
   */
  async getCurrentUser(): Promise<User | null> {
    const session = this.getSessionData();

    if (!session?.user) {
      return null;
    }

    return this.mapToDomainUser(session.user);
  }

  /**
   * Check if user is authenticated.
   */
  async isAuthenticated(): Promise<boolean> {
    const session = this.getSessionData();
    return session !== null && !!session.user;
  }
}

