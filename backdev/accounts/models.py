from django.contrib.auth.models import AbstractUser
from django.db import models

class TypeUtilisateur(models.Model):
    type_utilisateur = models.CharField(max_length=100)

    def __str__(self):
        return self.type_utilisateur

class Utilisateur(AbstractUser):
    # AbstractUser already provides 'username' and 'password'.
    email = models.EmailField(unique=True)
    
    # We add your custom relationship here.
    # Note: null=True, blank=True is temporarily added so that Django's 
    # 'python manage.py createsuperuser' command doesn't crash when you try 
    # to create your first admin user before any TypeUtilisateurs exist.
    type_utilisateur = models.ForeignKey(
        TypeUtilisateur, 
        on_delete=models.RESTRICT, 
        null=True, 
        blank=True
    )

    def save(self, *args, **kwargs):
            # 1. Check if this user has a type_utilisateur assigned
            if self.type_utilisateur is not None:
                # 2. If the role is "admin", automatically grant Django staff status
                if self.type_utilisateur.type_utilisateur == 'admin':
                    self.is_staff = True
                    self.is_superuser = True # Optional: gives them access to absolutely everything
                else:
                    # 3. If they are changed to a student or teacher, strip their admin rights
                    self.is_staff = False
                    self.is_superuser = False
                    
            # 4. Proceed with the normal save process
            super().save(*args, **kwargs)

    def __str__(self):
        return self.username