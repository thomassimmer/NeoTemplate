/**
 * Axios implementation of API client adapter.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  ApiError,
  ApiResponse,
  IApiClient,
  RequestConfig,
} from '@/src/domain/interfaces/api-client.interface';

/**
 * Token getter function type.
 * Returns the current auth token or null.
 */
export type TokenGetter = () => string | null;

/**
 * Axios-based API client implementation.
 * Implements IApiClient using axios as the underlying HTTP client.
 */
export class AxiosApiClient implements IApiClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private tokenGetter: TokenGetter | null = null;

  /**
   * Create a new Axios API client.
   *
   * @param baseURL - Base URL for API requests
   * @param isPrivate - Whether to use private backend URL (for server-side) or public (for client-side)
   * @param tokenGetter - Optional function to dynamically get auth token from session
   */
  constructor(
    baseURL: string,
    isPrivate: boolean = false,
    tokenGetter?: TokenGetter
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: isPrivate,
    });

    this.tokenGetter = tokenGetter || null;

    // Set up request interceptor to dynamically inject token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get token dynamically if tokenGetter is provided
        const token = this.tokenGetter ? this.tokenGetter() : this.authToken;
        if (token && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Convert axios error to domain ApiError.
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as
        | {
            message?: string;
            errors?: Record<string, string[]>;
            code?: string;
          }
        | undefined;

      return {
        message:
          errorData?.message ||
          axiosError.message ||
          'An error occurred',
        errors: errorData?.errors,
        code: errorData?.code,
        status: axiosError.response?.status,
      };
    }

    return {
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  /**
   * Convert axios request config to our RequestConfig.
   */
  private convertConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      headers: config?.headers,
      withCredentials: config?.withCredentials,
      signal: config?.signal,
    };
  }

  /**
   * Set authorization token for authenticated requests.
   * If tokenGetter is set, this will be used as a fallback.
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    // Note: The interceptor will handle setting the Authorization header dynamically
  }

  /**
   * Set token getter function for dynamic token retrieval.
   * This is preferred over setAuthToken as it ensures the latest token is always used.
   */
  setTokenGetter(tokenGetter: TokenGetter | null): void {
    this.tokenGetter = tokenGetter;
  }

  /**
   * Make a GET request.
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(
        url,
        this.convertConfig(config)
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request.
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(
        url,
        data,
        this.convertConfig(config)
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PUT request.
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(
        url,
        data,
        this.convertConfig(config)
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PATCH request.
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(
        url,
        data,
        this.convertConfig(config)
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request.
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(
        url,
        this.convertConfig(config)
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get the underlying axios instance (for backward compatibility).
   * @internal
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Factory function to create a public API client (client-side).
 * @param tokenGetter - Optional function to dynamically get auth token from session
 */
export function createPublicApiClient(
  tokenGetter?: TokenGetter
): AxiosApiClient {
  const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  return new AxiosApiClient(baseURL, false, tokenGetter);
}

/**
 * Factory function to create a private API client (server-side).
 * @param tokenGetter - Optional function to dynamically get auth token from session
 */
export function createPrivateApiClient(
  tokenGetter?: TokenGetter
): AxiosApiClient {
  const baseURL =
    process.env.NEXT_PRIVATE_BACKEND_URL || 'http://localhost:8000';
  return new AxiosApiClient(baseURL, true, tokenGetter);
}

