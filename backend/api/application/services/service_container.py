"""Service container for dependency injection."""

from typing import Optional

from api.application.interfaces.email_service import IEmailService
from api.application.interfaces.user_repository import IUserRepository
from api.application.use_cases.contact_use_case import ContactUseCase
from api.application.use_cases.user_use_case import UserUseCase
from api.domain.value_objects import Email
from api.infrastructure.repositories.user_repository import DjangoUserRepository
from api.infrastructure.services.email_service import DjangoEmailService
from django.conf import settings


class ServiceContainer:
    """Service container for dependency injection."""

    def __init__(self) -> None:
        """Initialize service container with concrete implementations."""
        # Infrastructure layer
        self._user_repository: Optional[IUserRepository] = None
        self._email_service: Optional[IEmailService] = None

        # Application layer
        self._user_use_case: Optional[UserUseCase] = None
        self._contact_use_case: Optional[ContactUseCase] = None

    @property
    def user_repository(self) -> IUserRepository:
        """Get user repository instance."""
        if self._user_repository is None:
            self._user_repository = DjangoUserRepository()
        return self._user_repository

    @property
    def email_service(self) -> IEmailService:
        """Get email service instance."""
        if self._email_service is None:
            self._email_service = DjangoEmailService()
        return self._email_service

    @property
    def user_use_case(self) -> UserUseCase:
        """Get user use case instance."""
        if self._user_use_case is None:
            self._user_use_case = UserUseCase(self.user_repository)
        return self._user_use_case

    @property
    def contact_use_case(self) -> ContactUseCase:
        """Get contact use case instance."""
        if self._contact_use_case is None:
            admin_email_str = settings.EMAIL_HOST_USER or "admin@example.com"
            try:
                admin_email = Email(admin_email_str)
            except ValueError:
                # Fallback to default if EMAIL_HOST_USER is invalid
                admin_email = Email("admin@example.com")
            site_name = getattr(settings, "SITE_NAME", "NeoTemplate")
            self._contact_use_case = ContactUseCase(
                self.email_service, admin_email, site_name
            )
        return self._contact_use_case


# Global service container instance
_service_container: Optional[ServiceContainer] = None


def get_service_container() -> ServiceContainer:
    """
    Get global service container instance (singleton).

    Returns:
        Service container instance
    """
    global _service_container
    if _service_container is None:
        _service_container = ServiceContainer()
    return _service_container

