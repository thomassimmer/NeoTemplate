from rest_framework import permissions

from api.models import User


class UserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user: User = request.user
        return user.is_authenticated and user.is_active

    def has_object_permission(self, request, view, user_object):
        user: User = request.user
        if user.is_authenticated and user.is_active:
            if request.method in permissions.SAFE_METHODS:
                return True
            if user.is_superuser or user == user_object:
                return True
        return False
