from rest_framework import serializers
from .models import Formation, Vague, UtilisateurVague
from accounts.models import Utilisateur 

class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = '__all__'

        read_only_fields = ['createur']

class CreateVagueSerializer(serializers.Serializer):
    formation_id = serializers.PrimaryKeyRelatedField(
        queryset=Formation.objects.all()
    )
    debut = serializers.DateTimeField()
    fin = serializers.DateTimeField()

    def validate(self, data):
        """
        Custom validation to ensure the timeline makes logical sense.
        """
        if data['fin'] <= data['debut']:
            raise serializers.ValidationError(
                {"fin": "La date de fin doit être strictement postérieure à la date de début."}
            )
        return data
    
class AssignStudentToVagueSerializer(serializers.Serializer):
    # This creates a dropdown of all Vagues
    vague_id = serializers.PrimaryKeyRelatedField(
        queryset=Vague.objects.all()
    )
    # This creates a dropdown of all Users (Students)
    etudiant_id = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.all() 
    )