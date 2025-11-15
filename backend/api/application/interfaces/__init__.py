"""Application interfaces (ports) - define contracts for infrastructure layer."""

from api.application.interfaces.email_service import IEmailService
from api.application.interfaces.user_repository import IUserRepository

__all__ = ["IEmailService", "IUserRepository"]

