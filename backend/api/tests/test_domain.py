"""Tests for domain layer - value objects and exceptions."""

from unittest import TestCase

from api.domain.exceptions import (
    DomainException,
    EmailServiceException,
    InvalidEmailException,
    UserNotFoundException,
)
from api.domain.value_objects import ContactMessage, Email


class EmailValueObjectTests(TestCase):
    """Tests for Email value object."""

    def test_valid_email(self) -> None:
        """Test creating Email with valid email address."""
        email = Email("test@example.com")
        self.assertEqual(email.value, "test@example.com")
        self.assertEqual(str(email), "test@example.com")

    def test_invalid_email_missing_at(self) -> None:
        """Test creating Email with missing @ symbol."""
        with self.assertRaises(ValueError):
            Email("invalid-email")

    def test_invalid_email_empty(self) -> None:
        """Test creating Email with empty string."""
        with self.assertRaises(ValueError):
            Email("")

    def test_invalid_email_none(self) -> None:
        """Test creating Email with None."""
        with self.assertRaises(ValueError):
            Email(None)  # type: ignore

    def test_email_immutability(self) -> None:
        """Test that Email is immutable."""
        email = Email("test@example.com")
        with self.assertRaises(Exception):
            email.value = "new@example.com"  # type: ignore


class ContactMessageValueObjectTests(TestCase):
    """Tests for ContactMessage value object."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.valid_email = Email("test@example.com")

    def test_valid_contact_message(self) -> None:
        """Test creating ContactMessage with valid data."""
        message = ContactMessage(
            email=self.valid_email,
            message="Hello, this is a test message.",
        )
        self.assertEqual(message.email, self.valid_email)
        self.assertEqual(message.message, "Hello, this is a test message.")
        self.assertEqual(message.max_length, 200)

    def test_contact_message_custom_max_length(self) -> None:
        """Test creating ContactMessage with custom max length."""
        message = ContactMessage(
            email=self.valid_email,
            message="Short message",
            max_length=100,
        )
        self.assertEqual(message.max_length, 100)

    def test_contact_message_empty_message(self) -> None:
        """Test creating ContactMessage with empty message."""
        with self.assertRaises(ValueError):
            ContactMessage(email=self.valid_email, message="")

    def test_contact_message_whitespace_only(self) -> None:
        """Test creating ContactMessage with whitespace-only message."""
        with self.assertRaises(ValueError):
            ContactMessage(email=self.valid_email, message="   ")

    def test_contact_message_exceeds_max_length(self) -> None:
        """Test creating ContactMessage that exceeds max length."""
        long_message = "a" * 201
        with self.assertRaises(ValueError) as context:
            ContactMessage(email=self.valid_email, message=long_message)
        self.assertIn("exceeds maximum length", str(context.exception))

    def test_contact_message_at_max_length(self) -> None:
        """Test creating ContactMessage at exactly max length."""
        message = ContactMessage(
            email=self.valid_email,
            message="a" * 200,
        )
        self.assertEqual(len(message.message), 200)

    def test_contact_message_immutability(self) -> None:
        """Test that ContactMessage is immutable."""
        message = ContactMessage(
            email=self.valid_email,
            message="Test message",
        )
        with self.assertRaises(Exception):
            message.message = "New message"  # type: ignore


class DomainExceptionTests(TestCase):
    """Tests for domain exceptions."""

    def test_domain_exception_base(self) -> None:
        """Test base DomainException."""
        exception = DomainException("Test error message")
        self.assertEqual(str(exception), "Test error message")
        self.assertEqual(exception.message, "Test error message")

    def test_user_not_found_exception(self) -> None:
        """Test UserNotFoundException."""
        exception = UserNotFoundException("User not found")
        self.assertIsInstance(exception, DomainException)
        self.assertEqual(exception.message, "User not found")

    def test_email_service_exception(self) -> None:
        """Test EmailServiceException."""
        exception = EmailServiceException("Email service failed")
        self.assertIsInstance(exception, DomainException)
        self.assertEqual(exception.message, "Email service failed")

    def test_invalid_email_exception(self) -> None:
        """Test InvalidEmailException."""
        exception = InvalidEmailException("Invalid email format")
        self.assertIsInstance(exception, DomainException)
        self.assertEqual(exception.message, "Invalid email format")

