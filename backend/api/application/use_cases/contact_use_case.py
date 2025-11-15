"""Contact use cases - application logic for contact form operations."""

from api.application.interfaces.email_service import IEmailService
from api.domain.exceptions import EmailServiceException
from api.domain.value_objects import ContactMessage, Email


class ContactUseCase:
    """Use cases for contact form operations."""

    def __init__(
        self,
        email_service: IEmailService,
        admin_email: Email,
        site_name: str = "NeoTemplate",
    ) -> None:
        """
        Initialize contact use case.

        Args:
            email_service: Service for sending emails
            admin_email: Admin email to receive contact messages
            site_name: Name of the site (for email subject)
        """
        self._email_service = email_service
        self._admin_email = admin_email
        self._site_name = site_name

    def send_contact_message(self, contact_message: ContactMessage) -> None:
        """
        Send a contact message to admin.

        Args:
            contact_message: Contact message value object

        Raises:
            EmailServiceException: If email sending fails
        """
        subject = f"Message from a user on {self._site_name}"
        message_body = f"{contact_message.email.value} vous a écrit:\n\n{contact_message.message}"

        try:
            self._email_service.send_email(
                subject=subject,
                message=message_body,
                from_email=contact_message.email,
                recipient_list=[self._admin_email],
            )
        except Exception as e:
            raise EmailServiceException(
                f"Failed to send contact message: {str(e)}"
            ) from e

