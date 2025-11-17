from allauth.account.views import confirm_email
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from rest_framework import routers

from api.views import UserViewSet, contact, health, version

router = routers.DefaultRouter()

router.register(r"users", UserViewSet, basename="user")

urlpatterns = (
    [
        path(settings.ADMIN_URL, admin.site.urls),
        path('api/', include(router.urls)),
        path('api/health/', health),
        path('api/version/', version),
        path('api/contact/', contact),

        # Path used to build our password reset link.
        path(
            "password-reset/confirm/<uidb64>/<token>/",
            TemplateView.as_view(template_name="password_reset_confirm.html"),
            name='password_reset_confirm'
        ),

        path('api/auth/', include("dj_rest_auth.urls")),
        path(
            'api/auth/registration/',
            include('dj_rest_auth.registration.urls')
        ),


        path(
            'api/accounts/',
            include('allauth.urls'),
            name='socialaccount_signup'
        ),

        # Address our adapter will build to give a link to our frontend.
        # See api.adapter.AccountAdapter.
        re_path(
            r"^confirm-email/(?P<key>[-:\w]+)/$",
            confirm_email,
            name="account_confirm_email",
        ),

    ]
    # Only serve static/media files in DEBUG mode (use web server in production)
    + (static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) if settings.DEBUG else [])
    + (static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) if settings.DEBUG else [])
)
