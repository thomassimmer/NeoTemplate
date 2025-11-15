"""User use cases - application logic for user operations."""

from typing import List, Optional

from api.application.interfaces.user_repository import IUserRepository
from api.domain.exceptions import UserNotFoundException
from api.models import User


class UserUseCase:
    """Use cases for user operations."""

    def __init__(self, user_repository: IUserRepository) -> None:
        """
        Initialize user use case.

        Args:
            user_repository: Repository for user data access
        """
        self._user_repository = user_repository

    def get_user_by_id(self, user_id: int) -> User:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User entity

        Raises:
            UserNotFoundException: If user not found
        """
        user = self._user_repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(f"User with ID {user_id} not found")
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            email: User email

        Returns:
            User entity or None if not found
        """
        return self._user_repository.get_by_email(email)

    def get_all_users(self) -> List[User]:
        """
        Get all users.

        Returns:
            List of all users
        """
        return self._user_repository.get_all()

    def update_user(self, user: User) -> User:
        """
        Update user.

        Args:
            user: User to update

        Returns:
            Updated user

        Raises:
            UserNotFoundException: If user not found
        """
        if not self._user_repository.exists(user.id):
            raise UserNotFoundException(f"User with ID {user.id} not found")
        return self._user_repository.save(user)

