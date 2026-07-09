from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, TypeUtilisateur

# Register the TypeUtilisateur normally
admin.site.register(TypeUtilisateur)

# Register the custom Utilisateur using Django's built-in UserAdmin
@admin.register(Utilisateur)
class CustomUserAdmin(UserAdmin):
    # Add 'type_utilisateur' to the fieldsets so it shows up on the edit screen
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('type_utilisateur',)}),
    )
    
    # Add it to the list display so you can see it in the table view
    list_display = ('username', 'email', 'type_utilisateur', 'is_staff')