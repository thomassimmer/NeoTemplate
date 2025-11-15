"""Django user repository implementation."""

from typing import List, Optional

from api.application.interfaces.user_repository import IUserRepository
from api.models import User


class DjangoUserRepository(IUserRepository):
    """Django ORM implementation of user repository."""

    def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User entity or None if not found
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            email: User email

        Returns:
            User entity or None if not found
        """
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    def get_all(self) -> List[User]:
        """
        Get all users.

        Returns:
            List of all users
        """
        return list(User.objects.all())

    def save(self, user: User) -> User:
        """
        Save or update user.

        Args:
            user: User to save

        Returns:
            Saved user
        """
        user.save()
        return user

    def exists(self, user_id: int) -> bool:
        """
        Check if user exists.

        Args:
            user_id: User ID

        Returns:
            True if user exists, False otherwise
        """
        return User.objects.filter(id=user_id).exists()

