/**
 * API client interface (port).
 * Defines the contract for making API requests.
 */

import { ContactMessage } from '../value-objects';
import { User } from '../entities';

/**
 * Response wrapper for API calls.
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText?: string;
}

/**
 * Error response from API.
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  status?: number;
}

/**
 * API client interface.
 * All API communication should go through this interface.
 */
export interface IApiClient {
  /**
   * Make a GET request.
   */
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

  /**
   * Make a POST request.
   */
  post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * Make a PUT request.
   */
  put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * Make a PATCH request.
   */
  patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * Make a DELETE request.
   */
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;

  /**
   * Set authorization token.
   */
  setAuthToken(token: string | null): void;
}

/**
 * Request configuration.
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

/**
 * User API response structure.
 */
export interface UserApiResponse {
  id: string;
  email: string;
  username: string;
  image: string | null;
  firstName?: string;
  lastName?: string;
}

/**
 * Contact form API response.
 */
export interface ContactApiResponse {
  message: string;
}

