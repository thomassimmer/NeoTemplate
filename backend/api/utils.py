from allauth.account.utils import user_pk_to_url_str
from django.conf import settings
from django.urls import reverse


def password_reset_url_generator(request, user, temp_key):
    path = reverse(
        'password_reset_confirm',
        args=[user_pk_to_url_str(user), temp_key],
    )

    return settings.FRONTEND_HOST + path
