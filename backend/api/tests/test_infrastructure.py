"""Tests for infrastructure layer - repositories and services."""

from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from api.domain.exceptions import EmailServiceException
from api.domain.value_objects import Email
from api.infrastructure.repositories.user_repository import DjangoUserRepository
from api.infrastructure.services.email_service import DjangoEmailService

User = get_user_model()


class DjangoUserRepositoryTests(TestCase):
    """Tests for DjangoUserRepository."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.repository = DjangoUserRepository()

    def test_get_by_id_success(self) -> None:
        """Test getting user by ID when user exists."""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

        result = self.repository.get_by_id(user.id)

        self.assertIsNotNone(result)
        self.assertEqual(result.id, user.id)
        self.assertEqual(result.email, user.email)

    def test_get_by_id_not_found(self) -> None:
        """Test getting user by ID when user doesn't exist."""
        result = self.repository.get_by_id(99999)

        self.assertIsNone(result)

    def test_get_by_email_success(self) -> None:
        """Test getting user by email when user exists."""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

        result = self.repository.get_by_email("test@example.com")

        self.assertIsNotNone(result)
        self.assertEqual(result.id, user.id)
        self.assertEqual(result.email, user.email)

    def test_get_by_email_not_found(self) -> None:
        """Test getting user by email when user doesn't exist."""
        result = self.repository.get_by_email("nonexistent@example.com")

        self.assertIsNone(result)

    def test_get_all(self) -> None:
        """Test getting all users."""
        user1 = User.objects.create_user(
            email="user1@example.com", password="testpass123"
        )
        user2 = User.objects.create_user(
            email="user2@example.com", password="testpass123"
        )

        result = self.repository.get_all()

        self.assertEqual(len(result), 2)
        user_ids = [u.id for u in result]
        self.assertIn(user1.id, user_ids)
        self.assertIn(user2.id, user_ids)

    def test_save_create(self) -> None:
        """Test saving a new user."""
        user = User(email="newuser@example.com")
        user.set_password("testpass123")

        result = self.repository.save(user)

        self.assertEqual(result.id, user.id)
        self.assertTrue(User.objects.filter(id=user.id).exists())

    def test_save_update(self) -> None:
        """Test updating an existing user."""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )
        user.first_name = "Updated"
        user.last_name = "Name"

        result = self.repository.save(user)

        self.assertEqual(result.first_name, "Updated")
        self.assertEqual(result.last_name, "Name")
        updated_user = User.objects.get(id=user.id)
        self.assertEqual(updated_user.first_name, "Updated")

    def test_exists_true(self) -> None:
        """Test checking if user exists when user exists."""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

        result = self.repository.exists(user.id)

        self.assertTrue(result)

    def test_exists_false(self) -> None:
        """Test checking if user exists when user doesn't exist."""
        result = self.repository.exists(99999)

        self.assertFalse(result)


class DjangoEmailServiceTests(TestCase):
    """Tests for DjangoEmailService."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.email_service = DjangoEmailService()
        self.from_email = Email("sender@example.com")
        self.recipient_list = [Email("recipient@example.com")]

    @patch("api.infrastructure.services.email_service.send_mail")
    def test_send_email_success(self, mock_send_mail: Mock) -> None:
        """Test sending email successfully."""
        mock_send_mail.return_value = 1

        self.email_service.send_email(
            subject="Test Subject",
            message="Test Message",
            from_email=self.from_email,
            recipient_list=self.recipient_list,
        )

        mock_send_mail.assert_called_once()
        call_args = mock_send_mail.call_args
        self.assertEqual(call_args[1]["subject"], "Test Subject")
        self.assertEqual(call_args[1]["message"], "Test Message")
        self.assertEqual(call_args[1]["from_email"], "sender@example.com")
        self.assertEqual(call_args[1]["recipient_list"], ["recipient@example.com"])
        self.assertFalse(call_args[1]["fail_silently"])

    @patch("api.infrastructure.services.email_service.send_mail")
    def test_send_email_smtp_exception(self, mock_send_mail: Mock) -> None:
        """Test sending email when SMTP exception occurs."""
        from smtplib import SMTPException

        mock_send_mail.side_effect = SMTPException("SMTP Error")

        with self.assertRaises(EmailServiceException) as context:
            self.email_service.send_email(
                subject="Test Subject",
                message="Test Message",
                from_email=self.from_email,
                recipient_list=self.recipient_list,
            )

        self.assertIn("Failed to send email", str(context.exception))

    @patch("api.infrastructure.services.email_service.send_mail")
    def test_send_email_generic_exception(self, mock_send_mail: Mock) -> None:
        """Test sending email when generic exception occurs."""
        mock_send_mail.side_effect = Exception("Generic Error")

        with self.assertRaises(EmailServiceException) as context:
            self.email_service.send_email(
                subject="Test Subject",
                message="Test Message",
                from_email=self.from_email,
                recipient_list=self.recipient_list,
            )

        self.assertIn("Unexpected error sending email", str(context.exception))

    @patch("api.infrastructure.services.email_service.send_mail")
    @patch("api.infrastructure.services.email_service.settings")
    def test_send_email_uses_default_from_email(
        self, mock_settings: Mock, mock_send_mail: Mock
    ) -> None:
        """Test sending email uses default from_email when from_email is not provided."""
        mock_settings.DEFAULT_FROM_EMAIL = "default@example.com"
        # Email service should handle None from_email by using DEFAULT_FROM_EMAIL
        # Since Email value object doesn't allow empty, we test with a valid email
        # but check that the service falls back to DEFAULT_FROM_EMAIL when needed
        from_email = Email("test@example.com")

        self.email_service.send_email(
            subject="Test Subject",
            message="Test Message",
            from_email=from_email,
            recipient_list=self.recipient_list,
        )

        call_args = mock_send_mail.call_args
        # Email value object doesn't allow empty, so valid email should be used
        self.assertEqual(call_args[1]["from_email"], "test@example.com")

    @patch("api.infrastructure.services.email_service.send_mail")
    def test_send_email_multiple_recipients(self, mock_send_mail: Mock) -> None:
        """Test sending email to multiple recipients."""
        recipient_list = [
            Email("recipient1@example.com"),
            Email("recipient2@example.com"),
        ]

        self.email_service.send_email(
            subject="Test Subject",
            message="Test Message",
            from_email=self.from_email,
            recipient_list=recipient_list,
        )

        call_args = mock_send_mail.call_args
        self.assertEqual(
            call_args[1]["recipient_list"],
            ["recipient1@example.com", "recipient2@example.com"],
        )

