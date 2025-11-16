"""Domain models - core entities."""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        # Use email as username if username not provided
        if "username" not in extra_fields:
            extra_fields["username"] = email
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.

    This model represents a user in the system with an optional profile image.
    Email is used as the primary authentication method (see settings.py).
    """

    # Use email as the unique identifier for authentication
    email = models.EmailField(unique=True, blank=False)

    image = models.ImageField(
        upload_to="images",
        null=True,
        blank=True,
        help_text="User profile image",
    )

    objects = UserManager()

    # Make email the username field; do not require additional fields for creates
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        """Meta options for User model."""

        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = "users"

    def __str__(self) -> str:
        """
        String representation of user.

        Returns:
            User email or username
        """
        return self.email or self.username
