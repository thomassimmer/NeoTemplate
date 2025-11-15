/**
 * User repository interface (port).
 * Defines the contract for user data operations.
 */

import { User } from '../entities';
import { UserNotFoundException } from '../exceptions';

/**
 * User update data.
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  image?: File | string | null;
}

/**
 * User repository interface.
 * All user data operations should go through this interface.
 */
export interface IUserRepository {
  /**
   * Get user by ID.
   * @throws {UserNotFoundException} If user not found
   */
  getById(userId: string): Promise<User>;

  /**
   * Get current authenticated user.
   * @throws {UserNotFoundException} If user not found
   */
  getCurrentUser(): Promise<User>;

  /**
   * Get all users.
   */
  getAll(): Promise<User[]>;

  /**
   * Update user information.
   * @throws {UserNotFoundException} If user not found
   * @throws {ValidationException} If update data is invalid
   */
  update(userId: string, data: UpdateUserData): Promise<User>;

  /**
   * Check if user exists.
   */
  exists(userId: string): Promise<boolean>;
}

