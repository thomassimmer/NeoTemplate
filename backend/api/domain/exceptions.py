"""Domain exceptions - business logic exceptions."""


class DomainException(Exception):
    """Base exception for domain layer."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(self.message)


class UserNotFoundException(DomainException):
    """Raised when a user cannot be found."""

    pass


class InvalidEmailException(DomainException):
    """Raised when an email is invalid."""

    pass


class EmailServiceException(DomainException):
    """Raised when email service fails."""

    pass

