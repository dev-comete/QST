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

    def __str__(self):
        return self.username