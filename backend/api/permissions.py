"""Permission classes for API endpoints."""

from typing import Any

from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView

from api.models import User


class UserPermission(permissions.BasePermission):
    """Permission class for user-related operations."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if user has permission to access the view.

        Args:
            request: HTTP request
            view: API view instance

        Returns:
            True if user is authenticated and active, False otherwise
        """
        if not request.user.is_authenticated:
            return False
        user: User = request.user
        return user.is_active

    def has_object_permission(
        self, request: Request, view: APIView, user_object: User
    ) -> bool:
        """
        Check if user has permission to access a specific object.

        Args:
            request: HTTP request
            view: API view instance
            user_object: User object to check permissions for

        Returns:
            True if user has permission, False otherwise

        Permission rules:
            - Safe methods (GET, HEAD, OPTIONS): All authenticated users
            - Unsafe methods (PUT, PATCH, DELETE): Only superusers or the user themselves
        """
        if not request.user.is_authenticated:
            return False
        user: User = request.user
        if not user.is_active:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if user.is_superuser or user == user_object:
            return True
        return False
