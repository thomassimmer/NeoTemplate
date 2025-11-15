"""Exception handlers for API responses."""

import logging
from typing import Any, Dict

from django.http import JsonResponse
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

from api.domain.exceptions import (
    DomainException,
    EmailServiceException,
    InvalidEmailException,
    UserNotFoundException,
)

logger = logging.getLogger(__name__)


class APIError(APIException):
    """Base API exception."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An error occurred"
    default_code = "error"

    def __init__(
        self,
        detail: str = None,
        code: str = None,
        status_code: int = None,
    ) -> None:
        """
        Initialize API error.

        Args:
            detail: Error detail message
            code: Error code
            status_code: HTTP status code
        """
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = detail
        if code is not None:
            self.code = code
        super().__init__(detail)


def domain_exception_handler(exc: Exception, context: Dict[str, Any]) -> JsonResponse:
    """
    Handle domain exceptions and convert them to API responses.

    Args:
        exc: Exception instance
        context: Request context

    Returns:
        JSON response with error details
    """
    if isinstance(exc, UserNotFoundException):
        logger.warning(f"User not found: {exc.message}")
        return JsonResponse(
            {"error": exc.message, "code": "user_not_found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, EmailServiceException):
        logger.error(f"Email service error: {exc.message}")
        return JsonResponse(
            {"error": "An error occurred. The message could not be sent.", "code": "email_service_error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, InvalidEmailException):
        logger.warning(f"Invalid email: {exc.message}")
        return JsonResponse(
            {"error": exc.message, "code": "invalid_email"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, DomainException):
        logger.error(f"Domain error: {exc.message}")
        return JsonResponse(
            {"error": exc.message, "code": "domain_error"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Fall back to default exception handler
    response = exception_handler(exc, context)
    if response is not None:
        return response

    return None

