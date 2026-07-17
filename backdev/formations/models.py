from django.conf import settings
from django.db import models

class Formation(models.Model):
    # Represents Formation/Dossier
    nom_formation = models.CharField(max_length=200)
    createur = models.ForeignKey(
            settings.AUTH_USER_MODEL, 
            on_delete=models.CASCADE,
            limit_choices_to={'type_utilisateur__type_utilisateur': 'formateur'} # Optional: restricts dropdowns in Django Admin
        )
    def __str__(self):
        return self.nom_formation

class Vague(models.Model):
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    debut = models.DateTimeField()
    fin = models.DateTimeField()

    def __str__(self):
        return f"Vague {self.id} - {self.formation.nom_formation}"

class UtilisateurVague(models.Model):
    vague = models.ForeignKey(Vague, on_delete=models.CASCADE)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('vague', 'utilisateur')
