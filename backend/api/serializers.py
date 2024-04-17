from dj_rest_auth.serializers import (
    PasswordResetSerializer as BasePasswordResetSerializer,
)
from django.conf import settings
from rest_framework import serializers

from api.models import User
from api.utils import password_reset_url_generator


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        exclude = ['user_permissions', 'is_superuser', 'last_login', 'date_joined']
        read_only_fields = ['username', 'is_staff', 'is_active', 'groups']

    def to_representation(self, obj):
        ret = super().to_representation(obj)
        if obj.image and obj.image.url:
            ret['image'] = obj.image.url
        return ret


class ContactFormSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=None, min_length=None, allow_blank=False)
    message = serializers.CharField(required=True, allow_blank=False, max_length=200)


class PasswordResetSerializer(BasePasswordResetSerializer):
    """
    Override to redirect to our frontend using a custom password_reset_url_generator.
    """

    def save(self):
        from allauth.account.forms import default_token_generator

        request = self.context.get('request')
        opts = {
            'use_https': request.is_secure(),
            'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
            'request': request,
            'token_generator': default_token_generator,
            'url_generator': password_reset_url_generator,
        }

        opts.update(self.get_email_options())
        self.reset_form.save(**opts)
