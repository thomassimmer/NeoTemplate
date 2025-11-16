"""API views - presentation layer endpoints."""

import logging

from django.http import JsonResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from api.application.services.service_container import get_service_container
from api.domain.exceptions import DomainException, EmailServiceException
from api.domain.value_objects import ContactMessage, Email
from api.models import User
from api.permissions import UserPermission
from api.presentation.exceptions import domain_exception_handler
from api.serializers import ContactFormSerializer, UserSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request: Request) -> JsonResponse:
    return JsonResponse({"status": "ok"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def version(request: Request) -> JsonResponse:
    # Return version information; env-driven in settings
    from django.conf import settings
    return JsonResponse({"version": settings.VERSION_SHA}, status=status.HTTP_200_OK)


class UserViewSet(
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for User operations."""

    serializer_class = UserSerializer
    permission_classes = (UserPermission,)

    @property
    def service_container(self):
        """Get service container instance."""
        return get_service_container()

    def get_queryset(self):
        """
        Get queryset based on request.

        Returns:
            QuerySet or list of users
        """
        return User.objects.all()

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        """
        Retrieve a user instance.

        Args:
            request: HTTP request
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            User serialized response
        """
        try:
            pk = kwargs.get("pk")
            user = self.service_container.user_use_case.get_user_by_id(int(pk))
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except (ValueError, DomainException) as e:
            logger.error(f"Error retrieving user: {str(e)}")
            response = domain_exception_handler(e, {"view": self})
            if response:
                return response
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request: Request, *args, **kwargs) -> Response:
        """
        Update a user instance.

        Args:
            request: HTTP request
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            Updated user serialized response
        """
        try:
            partial = kwargs.pop("partial", False)
            instance = self.get_object()
            serializer = self.get_serializer(
                instance, data=request.data, partial=partial
            )
            serializer.is_valid(raise_exception=True)

            updated_user = self.service_container.user_use_case.update_user(
                serializer.save()
            )
            serializer = self.get_serializer(updated_user)
            return Response(serializer.data)
        except DomainException as e:
            logger.error(f"Error updating user: {str(e)}")
            response = domain_exception_handler(e, {"view": self})
            if response:
                return response
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request: Request) -> Response:
        """
        Return the current authenticated user.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def contact(request: Request) -> JsonResponse:
    """
    Handle contact form submission.

    Args:
        request: HTTP request with contact form data

    Returns:
        JSON response indicating success or failure
    """
    serializer = ContactFormSerializer(data=request.data)

    if not serializer.is_valid():
        return JsonResponse(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Convert serializer data to domain value objects
        contact_email = Email(serializer.validated_data["email"])
        contact_message = ContactMessage(
            email=contact_email,
            message=serializer.validated_data["message"],
        )

        # Use application layer use case
        service_container = get_service_container()
        service_container.contact_use_case.send_contact_message(
            contact_message
        )

        return JsonResponse(
            {"message": "Message sent successfully"}, status=status.HTTP_200_OK
        )

    except (ValueError, DomainException) as e:
        logger.error(f"Error sending contact message: {str(e)}")
        response = domain_exception_handler(e, {"view": None})
        if response:
            return response
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
        )
    except EmailServiceException as e:
        logger.error(f"Email service error: {str(e)}")
        return JsonResponse(
            {
                "error": "An error occurred. The message could not be sent.",
                "code": "email_service_error",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
