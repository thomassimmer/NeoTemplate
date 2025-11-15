"""Django email service implementation."""

from typing import List

from django.conf import settings
from django.core.mail import send_mail
from smtplib import SMTPException

from api.application.interfaces.email_service import IEmailService
from api.domain.exceptions import EmailServiceException
from api.domain.value_objects import Email


class DjangoEmailService(IEmailService):
    """Django implementation of email service."""

    def send_email(
        self,
        subject: str,
        message: str,
        from_email: Email,
        recipient_list: List[Email],
    ) -> None:
        """
        Send an email using Django's email backend.

        Args:
            subject: Email subject
            message: Email message body
            from_email: Sender email
            recipient_list: List of recipient emails

        Raises:
            EmailServiceException: If email sending fails
        """
        recipient_emails = [email.value for email in recipient_list]
        from_email_value = from_email.value

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email_value or settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_emails,
                fail_silently=False,
            )
        except SMTPException as e:
            raise EmailServiceException(
                f"Failed to send email: {str(e)}"
            ) from e
        except Exception as e:
            raise EmailServiceException(
                f"Unexpected error sending email: {str(e)}"
            ) from e

