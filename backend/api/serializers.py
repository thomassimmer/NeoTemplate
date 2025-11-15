"""API serializers for request/response validation and transformation."""

from dj_rest_auth.serializers import (
    PasswordResetSerializer as BasePasswordResetSerializer,
)
from django.conf import settings
from rest_framework import serializers

from api.models import User
from api.utils import password_reset_url_generator


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        exclude = [
            "user_permissions",
            "is_superuser",
            "last_login",
            "date_joined",
        ]
        read_only_fields = ["username", "is_staff", "is_active", "groups"]

    def to_representation(self, obj: User) -> dict:
        """
        Transform model instance to representation.

        Args:
            obj: User instance

        Returns:
            Dictionary representation of user
        """
        ret = super().to_representation(obj)
        if obj.image and hasattr(obj.image, "url"):
            ret["image"] = obj.image.url
        return ret


class ContactFormSerializer(serializers.Serializer):
    """Serializer for contact form submission."""

    email = serializers.EmailField(
        max_length=None,
        min_length=None,
        allow_blank=False,
        help_text="Email address of the sender",
    )
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=200,
        help_text="Contact message (max 200 characters)",
    )

    def validate_message(self, value: str) -> str:
        """
        Validate message field.

        Args:
            value: Message value

        Returns:
            Validated message

        Raises:
            serializers.ValidationError: If message is invalid
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()


class PasswordResetSerializer(BasePasswordResetSerializer):
    """
    Override password reset serializer to redirect to frontend.

    Uses a custom password_reset_url_generator to build URLs pointing
    to the frontend application.
    """

    def save(self) -> None:
        """Save password reset request with custom URL generator."""
        from allauth.account.forms import default_token_generator

        request = self.context.get("request")
        opts = {
            "use_https": request.is_secure() if request else True,
            "from_email": getattr(settings, "DEFAULT_FROM_EMAIL"),
            "request": request,
            "token_generator": default_token_generator,
            "url_generator": password_reset_url_generator,
        }

        opts.update(self.get_email_options())
        self.reset_form.save(**opts)
