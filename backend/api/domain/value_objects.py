"""Value objects for the domain layer."""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Email:
    """Email value object with validation."""

    value: str

    def __post_init__(self) -> None:
        """Validate email format."""
        if self.value is None:
            raise ValueError("Invalid email format: None")
        if not self.value or "@" not in str(self.value):
            raise ValueError(f"Invalid email format: {self.value}")

    def __str__(self) -> str:
        """Return email as string."""
        return self.value


@dataclass(frozen=True)
class ContactMessage:
    """Contact message value object."""

    email: Email
    message: str
    max_length: int = 200

    def __post_init__(self) -> None:
        """Validate message."""
        if not self.message or not self.message.strip():
            raise ValueError("Message cannot be empty")
        if len(self.message) > self.max_length:
            raise ValueError(
                f"Message exceeds maximum length of {self.max_length} characters"
            )

