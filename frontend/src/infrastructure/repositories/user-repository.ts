/**
 * User repository implementation using API client.
 */

import { User } from '@/src/domain/entities';
import { UserNotFoundException, ValidationException } from '@/src/domain/exceptions';
import {
  IApiClient,
  UserApiResponse,
} from '@/src/domain/interfaces/api-client.interface';
import {
  IUserRepository,
  UpdateUserData,
} from '@/src/domain/interfaces/user-repository.interface';

/**
 * Convert API response to domain User entity.
 */
function mapApiResponseToUser(apiResponse: UserApiResponse): User {
  return new User(
    String(apiResponse.id),
    apiResponse.email,
    apiResponse.username,
    apiResponse.image || null,
    apiResponse.firstName,
    apiResponse.lastName
  );
}

/**
 * User repository implementation using API client.
 */
export class ApiUserRepository implements IUserRepository {
  constructor(private readonly apiClient: IApiClient) {}

  /**
   * Get user by ID.
   */
  async getById(userId: string): Promise<User> {
    try {
      const response = await this.apiClient.get<UserApiResponse>(
        `/api/users/${userId}/`
      );

      return mapApiResponseToUser(response.data);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'user_not_found'
      ) {
        throw new UserNotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }

  /**
   * Get current authenticated user.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.apiClient.get<UserApiResponse[]>(
        `/api/users/?me=1`
      );

      if (!response.data || response.data.length === 0) {
        throw new UserNotFoundException('Current user not found');
      }

      return mapApiResponseToUser(response.data[0]);
    } catch (error: unknown) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'user_not_found'
      ) {
        throw new UserNotFoundException('Current user not found');
      }
      throw error;
    }
  }

  /**
   * Get all users.
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await this.apiClient.get<UserApiResponse[]>(
        `/api/users/`
      );

      return response.data.map(mapApiResponseToUser);
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Update user information.
   */
  async update(userId: string, data: UpdateUserData): Promise<User> {
    try {
      // Handle file uploads separately if image is a File
      const formData = new FormData();

      if (data.username) formData.append('username', data.username);
      if (data.email) formData.append('email', data.email);
      if (data.password) formData.append('password', data.password);
      if (data.firstName) formData.append('first_name', data.firstName);
      if (data.lastName) formData.append('last_name', data.lastName);
      if (data.image !== undefined) {
        if (data.image instanceof File) {
          formData.append('image', data.image);
        } else if (data.image === null) {
          // Handle null case if needed
          formData.append('image', '');
        }
      }

      const response = await this.apiClient.patch<UserApiResponse>(
        `/api/users/${userId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return mapApiResponseToUser(response.data);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Validation failed',
          error.errors as Record<string, string[]>
        );
      }
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'user_not_found'
      ) {
        throw new UserNotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }

  /**
   * Check if user exists.
   */
  async exists(userId: string): Promise<boolean> {
    try {
      await this.getById(userId);
      return true;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return false;
      }
      throw error;
    }
  }
}

