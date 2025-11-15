/**
 * User use cases - application logic for user operations.
 */

import { User } from '@/src/domain/entities';
import {
  UserNotFoundException,
  ValidationException,
} from '@/src/domain/exceptions';
import { IUserRepository } from '@/src/domain/interfaces/user-repository.interface';
import { UpdateUserData } from '@/src/domain/interfaces/user-repository.interface';

/**
 * User use cases.
 */
export class UserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Get current authenticated user.
   *
   * @returns Current user
   * @throws {UserNotFoundException} If user not found
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await this.userRepository.getCurrentUser();
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new UserNotFoundException('Current user not found');
    }
  }

  /**
   * Get user by ID.
   *
   * @param userId - User ID
   * @returns User entity
   * @throws {UserNotFoundException} If user not found
   */
  async getUserById(userId: string): Promise<User> {
    try {
      return await this.userRepository.getById(userId);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new UserNotFoundException(`User with ID ${userId} not found`);
    }
  }

  /**
   * Get all users.
   *
   * @returns List of all users
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  /**
   * Update user profile.
   *
   * @param userId - User ID
   * @param data - Update data
   * @returns Updated user
   * @throws {UserNotFoundException} If user not found
   * @throws {ValidationException} If update data is invalid
   */
  async updateUser(
    userId: string,
    data: UpdateUserData
  ): Promise<User> {
    try {
      return await this.userRepository.update(userId, data);
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new ValidationException(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if user exists.
   *
   * @param userId - User ID
   * @returns True if user exists, false otherwise
   */
  async userExists(userId: string): Promise<boolean> {
    return this.userRepository.exists(userId);
  }
}

