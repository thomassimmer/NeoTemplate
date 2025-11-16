"""Tests for presentation layer - views, serializers, and custom logic."""

import json
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from api.domain.exceptions import (
    EmailServiceException,
    UserNotFoundException,
)
from api.domain.value_objects import ContactMessage, Email
from api.presentation.exceptions import domain_exception_handler
from api.serializers import ContactFormSerializer, UserSerializer

User = get_user_model()


class UserSerializerTests(TestCase):
    """Tests for UserSerializer - custom logic only."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

    def test_to_representation_handles_image_url(self) -> None:
        """Test custom to_representation method handles image URL correctly."""
        serializer = UserSerializer(self.user)
        data = serializer.data

        # Our custom to_representation should include image field
        # Even if None, it should be handled gracefully
        self.assertIn("image", data)


class ContactFormSerializerTests(TestCase):
    """Tests for ContactFormSerializer - custom validation logic only."""

    def test_validate_message_strips_whitespace(self) -> None:
        """Test custom validate_message method strips whitespace."""
        data = {
            "email": "test@example.com",
            "message": "  Test message  ",
        }

        serializer = ContactFormSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        # Our custom validation should strip whitespace
        self.assertEqual(serializer.validated_data["message"], "Test message")

    def test_validate_message_rejects_empty(self) -> None:
        """Test custom validate_message method rejects empty messages."""
        data = {"email": "test@example.com", "message": ""}

        serializer = ContactFormSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("message", serializer.errors)

    def test_validate_message_rejects_whitespace_only(self) -> None:
        """Test custom validate_message method rejects whitespace-only messages."""
        data = {"email": "test@example.com", "message": "   "}

        serializer = ContactFormSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("message", serializer.errors)


class DomainExceptionHandlerTests(TestCase):
    """Tests for domain exception handler."""

    def test_user_not_found_exception(self) -> None:
        """Test handling UserNotFoundException."""
        exception = UserNotFoundException("User not found")
        context = {"view": Mock()}

        response = domain_exception_handler(exception, context)

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = json.loads(response.content)
        self.assertEqual(data["error"], "User not found")
        self.assertEqual(data["code"], "user_not_found")

    def test_email_service_exception(self) -> None:
        """Test handling EmailServiceException."""
        exception = EmailServiceException("Email service failed")
        context = {"view": Mock()}

        response = domain_exception_handler(exception, context)

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code,
                         status.HTTP_500_INTERNAL_SERVER_ERROR)
        data = json.loads(response.content)
        self.assertIn("error", data)
        self.assertEqual(data["code"], "email_service_error")

    def test_domain_exception_fallback(self) -> None:
        """Test handling generic DomainException."""
        from api.domain.exceptions import DomainException

        exception = DomainException("Generic domain error")
        context = {"view": Mock()}

        response = domain_exception_handler(exception, context)

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = json.loads(response.content)
        self.assertEqual(data["error"], "Generic domain error")
        self.assertEqual(data["code"], "domain_error")


class UserViewSetTests(TestCase):
    """Tests for UserViewSet."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_list_users(self) -> None:
        """Test listing all users."""
        User.objects.create_user(
            email="other@example.com", password="testpass123"
        )

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return all users or just current user based on implementation
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_user(self) -> None:
        """Test retrieving a specific user."""
        response = self.client.get(f"/api/users/{self.user.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["email"], self.user.email)

    def test_retrieve_user_me(self) -> None:
        """Test retrieving current user with 'me' keyword."""
        response = self.client.get("/api/users/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)

    def test_update_user(self) -> None:
        """Test updating user."""
        data = {"first_name": "Updated", "last_name": "Name"}

        response = self.client.patch(f"/api/users/{self.user.id}/", data=data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.last_name, "Name")

    def test_list_users_unauthenticated(self) -> None:
        """Test listing users without authentication."""
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ContactViewTests(TestCase):
    """Tests for contact view."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.client = APIClient()

    @patch("api.views.get_service_container")
    def test_contact_post_success(self, mock_get_container: Mock) -> None:
        """Test successful contact form submission."""
        mock_use_case = Mock()
        mock_container = Mock()
        mock_container.contact_use_case = mock_use_case
        mock_get_container.return_value = mock_container

        data = {
            "email": "test@example.com",
            "message": "Test message",
        }

        response = self.client.post(
            "/api/contact/",
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)
        self.assertEqual(response_data["message"], "Message sent successfully")
        mock_use_case.send_contact_message.assert_called_once()

    def test_contact_post_invalid_data(self) -> None:
        """Test contact form submission with invalid data."""
        data = {"email": "invalid-email", "message": "Test message"}

        response = self.client.post(
            "/api/contact/",
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)
        self.assertIn("email", response_data)

    @patch("api.views.get_service_container")
    def test_contact_post_email_service_error(
        self, mock_get_container: Mock
    ) -> None:
        """Test contact form submission when email service fails."""
        mock_use_case = Mock()
        mock_use_case.send_contact_message.side_effect = EmailServiceException(
            "Email service error"
        )
        mock_container = Mock()
        mock_container.contact_use_case = mock_use_case
        mock_get_container.return_value = mock_container

        data = {
            "email": "test@example.com",
            "message": "Test message",
        }

        response = self.client.post(
            "/api/contact/",
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code,
                         status.HTTP_500_INTERNAL_SERVER_ERROR)
        response_data = json.loads(response.content)
        self.assertEqual(response_data["code"], "email_service_error")

    def test_contact_post_empty_message(self) -> None:
        """Test contact form submission with empty message."""
        data = {"email": "test@example.com", "message": ""}

        response = self.client.post(
            "/api/contact/",
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response_data = json.loads(response.content)
        self.assertIn("message", response_data)
