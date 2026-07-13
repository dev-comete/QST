from rest_framework import permissions

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow the creator of an object to edit it.
    Admins can edit anything. Students can view anything.
    """
    def has_object_permission(self, request, view, obj):
        # 1. Read permissions (GET) are allowed for anyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # 2. Admins can do whatever they want
        if request.user.is_staff or request.user.is_superuser:
            return True

        # 3. For editing (PUT/PATCH/DELETE), the user MUST be the creator
        # Change 'createur' to whatever you named the ForeignKey in your model
        return obj.createur == request.user

class IsFormateurOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow formateurs and admins to edit or create.
    Students (apprenants) can only view (GET).
    """
    def has_permission(self, request, view):
        # 1. Reject unauthenticated users immediately
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Allow GET, HEAD, or OPTIONS requests for any logged-in user (like students viewing a quiz)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 3. For POST, PUT, DELETE, check if the user is a formateur or admin
        is_formateur = getattr(request.user, 'type_utilisateur', '') == 'formateur'
        is_admin = request.user.is_staff or request.user.is_superuser
        
        return is_formateur or is_admin

class IsApprenant(permissions.BasePermission):
    """
    Custom permission to ensure ONLY students can submit a quiz.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        return getattr(request.user, 'type_utilisateur', '') == 'apprenant'