from smtplib import SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from rest_framework import mixins, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from api.models import User
from api.permissions import UserPermission
from api.serializers import ContactFormSerializer, UserSerializer


@permission_classes([UserPermission])
class UserViewSet(
        mixins.UpdateModelMixin,
        mixins.RetrieveModelMixin,
        mixins.ListModelMixin,
        viewsets.GenericViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        user: User = self.request.user

        if self.request.GET.get("me", False):
            return [user]

        return User.objects.all()


@api_view(['POST'])
@permission_classes([AllowAny])
def contact(request):
    serializer = ContactFormSerializer(data=request.data)

    if serializer.is_valid():
        try:
            send_mail(
                subject="Message from a user on NeoTemplate",
                message=f"{serializer.data['email']} vous a écrit:\n\n{serializer.data['message']}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
        except SMTPException:
            return JsonResponse({"error": "An error occured. The message could not be sent."})
    else:
        return JsonResponse(serializer.errors, status=400)

    return JsonResponse({"ok": "ok"})
