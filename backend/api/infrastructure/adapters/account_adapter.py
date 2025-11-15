"""Django allauth account adapter implementation."""

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.urls import reverse


class AccountAdapter(DefaultAccountAdapter):
    """
    Overwrites email confirmation URL so that the correct URL is sent in the email.
    
    To change the actual address, see core.urls name: 'account_confirm_email'
    """

    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Get email confirmation URL pointing to frontend.

        Args:
            request: HTTP request
            emailconfirmation: Email confirmation instance

        Returns:
            Email confirmation URL
        """
        url = reverse("account_confirm_email", args=[emailconfirmation.key])
        return settings.FRONTEND_HOST + url

