/**
 * Service container for dependency injection.
 * Manages creation and lifecycle of services and repositories.
 */

import { IApiClient } from '@/src/domain/interfaces/api-client.interface';
import { IAuthService } from '@/src/domain/interfaces/auth-service.interface';
import { IUserRepository } from '@/src/domain/interfaces/user-repository.interface';
import { createPrivateApiClient, createPublicApiClient } from '@/src/infrastructure/api/axios-api-client';
import { NextAuthAuthService, SessionData } from '@/src/infrastructure/auth/nextauth-auth-service';
import { ApiUserRepository } from '@/src/infrastructure/repositories/user-repository';
import { AuthUseCase } from '../use-cases/auth-use-case';
import { ContactUseCase } from '../use-cases/contact-use-case';
import { UserUseCase } from '../use-cases/user-use-case';

/**
 * Service container for dependency injection.
 * Handles creation and management of infrastructure adapters.
 */
export class ServiceContainer {
  private _apiClient: IApiClient | null = null;
  private _privateApiClient: IApiClient | null = null;
  private _userRepository: IUserRepository | null = null;
  private _authService: IAuthService | null = null;
  private _authUseCase: AuthUseCase | null = null;
  private _userUseCase: UserUseCase | null = null;
  private _contactUseCase: ContactUseCase | null = null;

  /**
   * Initialize service container.
   *
   * @param isServerSide - Whether we're on server-side (true) or client-side (false)
   * @param getSessionData - Optional function to get session data (required for client-side auth)
   */
  constructor(
    private readonly isServerSide: boolean = false,
    private readonly getSessionData?: () => SessionData | null
  ) {}

  /**
   * Get public API client (for client-side usage).
   */
  getApiClient(): IApiClient {
    if (this._apiClient === null) {
      // Create API client with token getter for dynamic token retrieval
      const tokenGetter = this.getSessionData
        ? () => {
            const session = this.getSessionData?.();
            return session?.user?.access || null;
          }
        : undefined;
      this._apiClient = createPublicApiClient(tokenGetter);
    } else {
      // Update token getter if session getter changed
      if (this.getSessionData && 'setTokenGetter' in this._apiClient) {
        const tokenGetter = () => {
          const session = this.getSessionData?.();
          return session?.user?.access || null;
        };
        (this._apiClient as any).setTokenGetter(tokenGetter);
      }
    }
    return this._apiClient;
  }

  /**
   * Get private API client (for server-side usage).
   */
  getPrivateApiClient(): IApiClient {
    if (this._privateApiClient === null) {
      // Create API client with token getter for dynamic token retrieval
      const tokenGetter = this.getSessionData
        ? () => {
            const session = this.getSessionData?.();
            return session?.user?.access || null;
          }
        : undefined;
      this._privateApiClient = createPrivateApiClient(tokenGetter);
    } else {
      // Update token getter if session getter changed
      if (this.getSessionData && 'setTokenGetter' in this._privateApiClient) {
        const tokenGetter = () => {
          const session = this.getSessionData?.();
          return session?.user?.access || null;
        };
        (this._privateApiClient as any).setTokenGetter(tokenGetter);
      }
    }
    return this._privateApiClient;
  }

  /**
   * Get user repository.
   */
  getUserRepository(): IUserRepository {
    if (this._userRepository === null) {
      const apiClient = this.isServerSide
        ? this.getPrivateApiClient()
        : this.getApiClient();
      this._userRepository = new ApiUserRepository(apiClient);
    }
    return this._userRepository;
  }

  /**
   * Get authentication service (client-side only).
   * @throws Error if getSessionData is not provided
   */
  getAuthService(): IAuthService {
    if (this._authService === null) {
      if (!this.getSessionData) {
        throw new Error(
          'AuthService requires getSessionData function. Use createClientServiceContainer() for client-side usage.'
        );
      }
      this._authService = new NextAuthAuthService(
        this.getApiClient(),
        this.getSessionData
      );
    }
    return this._authService;
  }

  /**
   * Update session data getter (useful when session changes).
   */
  setSessionDataGetter(getSessionData: () => SessionData | null): void {
    // Reset auth service and use cases so they use new getter
    this._authService = null;
    this._authUseCase = null;
    // @ts-ignore - we're replacing the private readonly, which is needed for reactivity
    this.getSessionData = getSessionData;
    
    // Update token getters on existing API clients
    const tokenGetter = () => {
      const session = getSessionData();
      return session?.user?.access || null;
    };
    if (this._apiClient && 'setTokenGetter' in this._apiClient) {
      (this._apiClient as any).setTokenGetter(tokenGetter);
    }
    if (this._privateApiClient && 'setTokenGetter' in this._privateApiClient) {
      (this._privateApiClient as any).setTokenGetter(tokenGetter);
    }
  }

  /**
   * Get authentication use case.
   * @throws Error if getSessionData is not provided (client-side only)
   */
  getAuthUseCase(): AuthUseCase {
    if (this._authUseCase === null) {
      const apiClient = this.isServerSide
        ? this.getPrivateApiClient()
        : this.getApiClient();
      this._authUseCase = new AuthUseCase(
        this.getAuthService(),
        apiClient
      );
    }
    return this._authUseCase;
  }

  /**
   * Get user use case.
   */
  getUserUseCase(): UserUseCase {
    if (this._userUseCase === null) {
      this._userUseCase = new UserUseCase(this.getUserRepository());
    }
    return this._userUseCase;
  }

  /**
   * Get contact use case.
   */
  getContactUseCase(): ContactUseCase {
    if (this._contactUseCase === null) {
      const apiClient = this.isServerSide
        ? this.getPrivateApiClient()
        : this.getApiClient();
      this._contactUseCase = new ContactUseCase(apiClient);
    }
    return this._contactUseCase;
  }
}

/**
 * Create a service container for client-side usage.
 * @param getSessionData - Function to get current session data
 */
export function createClientServiceContainer(
  getSessionData: () => SessionData | null
): ServiceContainer {
  return new ServiceContainer(false, getSessionData);
}

/**
 * Create a service container for server-side usage.
 */
export function createServerServiceContainer(): ServiceContainer {
  return new ServiceContainer(true);
}

