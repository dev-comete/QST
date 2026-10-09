from django.conf import settings
from rest_framework.permissions import BasePermission


def is_formateur(user) -> bool:
    """
    Single source of truth for "who may use the chat" (REST + WebSocket).

    """
    if not user or not getattr(user, 'is_authenticated', False) or not user.is_active:
        return False
    if user.is_superuser:
        return True

    field = getattr(settings, 'CHAT_ROLE_FIELD', 'role')
    allowed = {str(r).lower() for r in getattr(settings, 'CHAT_ALLOWED_ROLES', ('formateur',))}
    value = getattr(user, field, None)

    # If the role field is a related object (FK like `type_utilisateur`),
    # extract its string representation or a known attribute.
    if value is None:
        return False
    # Common pattern: value might be a model with attribute `type_utilisateur`.
    attr = getattr(value, 'type_utilisateur', None)
    if attr is not None:
        value_str = str(attr).lower()
    else:
        # Fallback: string conversions (covers plain strings and other types)
        try:
            value_str = str(value).lower()
        except Exception:
            return False

    return value_str in allowed


class IsFormateur(BasePermission):
    def has_permission(self, request, view):
        return is_formateur(request.user)
