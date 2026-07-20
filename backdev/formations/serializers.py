from rest_framework import serializers
from .models import Formation, Vague, UtilisateurVague
from quizzes.models import Quiz
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

class AssignQuizToVagueSerializer(serializers.Serializer):
    # These activate the dropdowns in the DRF Browsable API
    quiz_id = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all()
    )
    vague_id = serializers.PrimaryKeyRelatedField(
        queryset=Vague.objects.all()
    )

    def validate(self, data):
        """
        Ensure the Quiz and the Vague are actually for the exact same Formation.
        Because of PrimaryKeyRelatedField, data['quiz_id'] is already the Quiz object!
        """
        quiz = data['quiz_id']
        vague = data['vague_id']
        
        if quiz.formation != vague.formation:
            raise serializers.ValidationError(
                "Incohérence : Le quiz et la vague doivent appartenir à la même formation."
            )
            
        return data

class VagueStudentSerializer(serializers.ModelSerializer):
    """Formats the nested student data for a specific Vague."""
    # We pull the actual user details from the 'utilisateur' foreign key
    etudiant_id = serializers.IntegerField(source='utilisateur.id', read_only=True)
    username = serializers.CharField(source='utilisateur.username', read_only=True)
    email = serializers.EmailField(source='utilisateur.email', read_only=True)

    class Meta:
        model = UtilisateurVague
        fields = ['etudiant_id', 'username', 'email']

class VagueListWithStudentsSerializer(serializers.ModelSerializer):
    """Main serializer that returns the Vague and embeds its students."""
    formation_nom = serializers.CharField(source='formation.nom_formation', read_only=True)
    
    # We use '_set' because it is the default reverse relation name in Django 
    # if you didn't set a related_name on the UtilisateurVague model.
    etudiants = VagueStudentSerializer(source='utilisateurvague_set', many=True, read_only=True)

    class Meta:
        model = Vague
        fields = ['id', 'formation_nom', 'debut', 'fin', 'etudiants']
    