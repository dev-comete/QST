from rest_framework import serializers
from .models import Formation, Vague, UtilisateurVague
from accounts.models import Utilisateur 

class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = '__all__'

        read_only_fields = ['createur']

class CreateVagueSerializer(serializers.Serializer):
    # This creates a dropdown menu of all Formations in the DRF UI!
    formation_id = serializers.PrimaryKeyRelatedField(
        queryset=Formation.objects.all()
    )
    date_vague = serializers.DateTimeField()
    
class AssignStudentToVagueSerializer(serializers.Serializer):
    # This creates a dropdown of all Vagues
    vague_id = serializers.PrimaryKeyRelatedField(
        queryset=Vague.objects.all()
    )
    # This creates a dropdown of all Users (Students)
    etudiant_id = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.all() 
    )