from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.urls import reverse

# Overwrites email confirmation url so that the correct url is sent in the email.
# to change the actual address, see core.urls name: 'account_confirm_email'


class AccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        url = reverse(
            "account_confirm_email",
            args=[emailconfirmation.key])
        return settings.FRONTEND_HOST + url
