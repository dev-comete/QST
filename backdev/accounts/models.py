from django.db import models

class TypeUtilisateur(models.Model):
    # Django automatically creates an 'id' primary key.
    type_utilisateur = models.CharField(max_length=100)

    def __str__(self):
        return self.type_utilisateur

class Utilisateur(models.Model):
    # A modifier encore en fonction de la situation avec Dolibarr
    type_utilisateur = models.ForeignKey(TypeUtilisateur, on_delete=models.RESTRICT)
    username = models.CharField(max_length=150, unique=True)
    mail = models.EmailField(unique=True)
    password = models.CharField(max_length=255) #à securiser le moment voulu , ca sert juste comme prototypage d'abord

    def __str__(self):
        return self.username
