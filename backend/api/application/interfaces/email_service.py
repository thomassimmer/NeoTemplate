"""Email service interface (port)."""

from abc import ABC, abstractmethod
from typing import List

from api.domain.value_objects import Email


class IEmailService(ABC):
    """Interface for email service."""

    @abstractmethod
    def send_email(
        self,
        subject: str,
        message: str,
        from_email: Email,
        recipient_list: List[Email],
    ) -> None:
        """
        Send an email.

        Args:
            subject: Email subject
            message: Email message body
            from_email: Sender email
            recipient_list: List of recipient emails

        Raises:
            EmailServiceException: If email sending fails
        """
        pass

