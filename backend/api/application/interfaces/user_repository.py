"""User repository interface (port)."""

from abc import ABC, abstractmethod
from typing import List, Optional

from api.models import User


class IUserRepository(ABC):
    """Interface for user repository."""

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        pass

    @abstractmethod
    def get_all(self) -> List[User]:
        """Get all users."""
        pass

    @abstractmethod
    def save(self, user: User) -> User:
        """Save or update user."""
        pass

    @abstractmethod
    def exists(self, user_id: int) -> bool:
        """Check if user exists."""
        pass

