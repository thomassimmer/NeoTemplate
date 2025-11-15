/**
 * Contact use cases - application logic for contact form operations.
 */

import { EmailServiceException, ValidationException } from '@/src/domain/exceptions';
import { ContactMessage, Email } from '@/src/domain/value-objects';
import { IApiClient, ContactApiResponse } from '@/src/domain/interfaces/api-client.interface';

/**
 * Contact form submission result.
 */
export interface ContactResult {
  success: boolean;
  message: string;
}

/**
 * Contact use cases.
 */
export class ContactUseCase {
  constructor(private readonly apiClient: IApiClient) {}

  /**
   * Send a contact message.
   *
   * @param email - Sender email
   * @param message - Contact message
   * @returns Contact result
   * @throws {ValidationException} If message data is invalid
   * @throws {EmailServiceException} If message cannot be sent
   */
  async sendContactMessage(
    email: string,
    message: string
  ): Promise<ContactResult> {
    try {
      // Create domain value objects with validation
      const emailValue = new Email(email);
      const contactMessage = new ContactMessage(emailValue, message);

      // Convert to FormData for API (matches backend expectations)
      const formData = new FormData();
      formData.append('email', contactMessage.email.value);
      formData.append('message', contactMessage.message);

      await this.apiClient.post<ContactApiResponse>(
        '/api/contact/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        message: 'Your message has been sent, thank you.',
      };
    } catch (error: unknown) {
      if (error instanceof ValidationException) {
        throw error;
      }

      // Handle API validation errors
      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors
      ) {
        throw new ValidationException(
          'Contact form validation failed',
          error.errors as Record<string, string[]>
        );
      }

      // Handle email service errors
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'email_service_error'
      ) {
        throw new EmailServiceException(
          'An error occurred. The message could not be sent.'
        );
      }

      throw new EmailServiceException(
        `Failed to send contact message: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

