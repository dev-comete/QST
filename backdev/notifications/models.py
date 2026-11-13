from django.db import models
from django.conf import settings

class Notification(models.Model):
    destinataire = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    titre = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    type_notif = models.CharField(max_length=50, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.titre} - {self.destinataire.username}"