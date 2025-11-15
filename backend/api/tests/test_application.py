"""Tests for application layer - use cases."""

from unittest.mock import MagicMock, Mock, patch

from django.test import TestCase

from api.application.use_cases.contact_use_case import ContactUseCase
from api.application.use_cases.user_use_case import UserUseCase
from api.domain.exceptions import (
    EmailServiceException,
    UserNotFoundException,
)
from api.domain.value_objects import ContactMessage, Email
from api.models import User


class UserUseCaseTests(TestCase):
    """Tests for UserUseCase."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.mock_repository = Mock()
        self.use_case = UserUseCase(self.mock_repository)

    def test_get_user_by_id_success(self) -> None:
        """Test getting user by ID when user exists."""
        user = Mock(spec=User)
        user.id = 1
        self.mock_repository.get_by_id.return_value = user

        result = self.use_case.get_user_by_id(1)

        self.assertEqual(result, user)
        self.mock_repository.get_by_id.assert_called_once_with(1)

    def test_get_user_by_id_not_found(self) -> None:
        """Test getting user by ID when user doesn't exist."""
        self.mock_repository.get_by_id.return_value = None

        with self.assertRaises(UserNotFoundException):
            self.use_case.get_user_by_id(1)

    def test_get_user_by_email_success(self) -> None:
        """Test getting user by email when user exists."""
        user = Mock(spec=User)
        self.mock_repository.get_by_email.return_value = user

        result = self.use_case.get_user_by_email("test@example.com")

        self.assertEqual(result, user)
        self.mock_repository.get_by_email.assert_called_once_with(
            "test@example.com"
        )

    def test_get_user_by_email_not_found(self) -> None:
        """Test getting user by email when user doesn't exist."""
        self.mock_repository.get_by_email.return_value = None

        result = self.use_case.get_user_by_email("test@example.com")

        self.assertIsNone(result)

    def test_get_all_users(self) -> None:
        """Test getting all users."""
        users = [Mock(spec=User), Mock(spec=User)]
        self.mock_repository.get_all.return_value = users

        result = self.use_case.get_all_users()

        self.assertEqual(result, users)
        self.mock_repository.get_all.assert_called_once()

    def test_update_user_success(self) -> None:
        """Test updating user when user exists."""
        user = Mock(spec=User)
        user.id = 1
        updated_user = Mock(spec=User)
        updated_user.id = 1

        self.mock_repository.exists.return_value = True
        self.mock_repository.save.return_value = updated_user

        result = self.use_case.update_user(user)

        self.assertEqual(result, updated_user)
        self.mock_repository.exists.assert_called_once_with(1)
        self.mock_repository.save.assert_called_once_with(user)

    def test_update_user_not_found(self) -> None:
        """Test updating user when user doesn't exist."""
        user = Mock(spec=User)
        user.id = 1
        self.mock_repository.exists.return_value = False

        with self.assertRaises(UserNotFoundException):
            self.use_case.update_user(user)

        self.mock_repository.exists.assert_called_once_with(1)
        self.mock_repository.save.assert_not_called()


class ContactUseCaseTests(TestCase):
    """Tests for ContactUseCase."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.mock_email_service = Mock()
        self.admin_email = Email("admin@example.com")
        self.use_case = ContactUseCase(
            self.mock_email_service, self.admin_email, "TestSite"
        )

    def test_send_contact_message_success(self) -> None:
        """Test sending contact message successfully."""
        contact_email = Email("user@example.com")
        contact_message = ContactMessage(
            email=contact_email, message="Test message"
        )

        self.use_case.send_contact_message(contact_message)

        self.mock_email_service.send_email.assert_called_once()
        call_args = self.mock_email_service.send_email.call_args
        self.assertEqual(call_args[1]["subject"], "Message from a user on TestSite")
        self.assertIn("user@example.com", call_args[1]["message"])
        self.assertIn("Test message", call_args[1]["message"])
        self.assertEqual(call_args[1]["from_email"], contact_email)
        self.assertEqual(call_args[1]["recipient_list"], [self.admin_email])

    def test_send_contact_message_email_service_error(self) -> None:
        """Test sending contact message when email service fails."""
        contact_email = Email("user@example.com")
        contact_message = ContactMessage(
            email=contact_email, message="Test message"
        )

        self.mock_email_service.send_email.side_effect = Exception(
            "Email service error"
        )

        with self.assertRaises(EmailServiceException) as context:
            self.use_case.send_contact_message(contact_message)

        self.assertIn("Failed to send contact message", str(context.exception))

    def test_send_contact_message_different_site_name(self) -> None:
        """Test contact message with different site name."""
        use_case = ContactUseCase(
            self.mock_email_service, self.admin_email, "MySite"
        )
        contact_email = Email("user@example.com")
        contact_message = ContactMessage(
            email=contact_email, message="Test message"
        )

        use_case.send_contact_message(contact_message)

        call_args = self.mock_email_service.send_email.call_args
        self.assertEqual(call_args[1]["subject"], "Message from a user on MySite")

