from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class Organisation(models.Model):
    nom = models.CharField(max_length=200, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nom

class TypeUtilisateur(models.Model):
    type_utilisateur = models.CharField(max_length=100)

    def __str__(self):
        return self.type_utilisateur

class Utilisateur(AbstractUser):
    # AbstractUser already provides 'username' and 'password'.
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
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

    organisation = models.ManyToManyField(
        Organisation, 
        #on_delete=models.CASCADE, 
        blank=True,
        related_name='utilisateurs'
    )

    @property
    def orga_principale(self):
        """
        Raccourci très pratique !
        Renvoie l'organisation unique du formateur pour simplifier vos requêtes.
        """
        return self.organisation.first()

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

class PasswordResetRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='password_reset_requests'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # L'administrateur qui a traité la demande
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='resolved_resets'
    )

    class Meta:
        ordering = ['-requested_at']
        verbose_name = "Demande de réinitialisation"
        verbose_name_plural = "Demandes de réinitialisation"

    def __str__(self):
        return f"Demande de {self.user.email} - {self.get_status_display()}"