/**
 * Utilities for handling form validation errors.
 */

import { ValidationException } from '@/src/domain/exceptions';

/**
 * Form error structure.
 */
export interface FormErrors {
  [field: string]: string[];
}

/**
 * Field-level error messages.
 */
export interface FieldErrors {
  [field: string]: string;
}

/**
 * Extract field errors from a ValidationException.
 *
 * @param error - Validation exception
 * @returns Field errors object
 */
export function extractFieldErrors(error: ValidationException): FieldErrors {
  const fieldErrors: FieldErrors = {};
  
  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages.join('\n');
      }
    });
  }
  
  return fieldErrors;
}

/**
 * Extract general (non-field) errors from an error.
 *
 * @param error - Error object
 * @returns Array of error messages
 */
export function extractGeneralErrors(error: unknown): string[] {
  if (error instanceof ValidationException) {
    // Check if there are non-field errors
    if (error.errors && error.errors.nonFieldErrors) {
      return error.errors.nonFieldErrors;
    }
    
    // If there's a message and no field-specific errors, use the message
    if (error.message && Object.keys(error.errors || {}).length === 0) {
      return [error.message];
    }
  }
  
  if (error instanceof Error) {
    return [error.message];
  }
  
  return ['An error occurred.'];
}

/**
 * Extract detail error message from API error response.
 *
 * @param error - Error object (may have detail property)
 * @returns Error message or null
 */
export function extractDetailError(error: unknown): string | null {
  if (
    error &&
    typeof error === 'object' &&
    'detail' in error &&
    typeof error.detail === 'string'
  ) {
    return error.detail;
  }
  
  return null;
}

/**
 * Format validation errors for display.
 *
 * @param error - Validation exception
 * @returns Object with fieldErrors and generalErrors
 */
export function formatValidationErrors(error: ValidationException): {
  fieldErrors: FieldErrors;
  generalErrors: string[];
} {
  return {
    fieldErrors: extractFieldErrors(error),
    generalErrors: extractGeneralErrors(error),
  };
}

