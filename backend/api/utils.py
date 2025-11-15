"""Utility functions for API."""

from typing import Any

from allauth.account.utils import user_pk_to_url_str
from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


def password_reset_url_generator(
    request: Any, user: User, temp_key: str
) -> str:
    """
    Generate password reset URL pointing to frontend.

    Args:
        request: HTTP request object
        user: User instance
        temp_key: Temporary key for password reset

    Returns:
        Password reset URL with frontend host
    """
    path = reverse(
        "password_reset_confirm",
        args=[user_pk_to_url_str(user), temp_key],
    )

    return settings.FRONTEND_HOST + path
