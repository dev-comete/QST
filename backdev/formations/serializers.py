from rest_framework import serializers
from .models import Formation, Vague, UtilisateurVague 
from quizzes.models import Quiz, UtilisateurQuiz
from accounts.models import Utilisateur 

class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = '__all__'

        read_only_fields = ['createur']

class VagueSerializer(serializers.ModelSerializer):
    a_des_evaluations_en_cours = serializers.SerializerMethodField()

    class Meta:
        model = Vague
        fields = '__all__'

    def get_a_des_evaluations_en_cours(self, obj):
        # Vérifie si au moins un étudiant a commencé un quiz dans cette vague
        return UtilisateurQuiz.objects.filter(vague=obj, heure_debut__isnull=False).exists()

class CreateVagueSerializer(serializers.Serializer):
    nom_vague = serializers.CharField(max_length=255)
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
    etudiant_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            # DRF n'acceptera que les IDs des utilisateurs ayant le rôle 'apprenant'
            queryset=Utilisateur.objects.filter(type_utilisateur__type_utilisateur='apprenant')
        ),
        allow_empty=False,
        help_text="Liste des IDs des étudiants à inscrire."
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
    formation_id = serializers.IntegerField(source='formation.id', read_only=True)
    formation_nom = serializers.CharField(source='formation.nom_formation', read_only=True)
    
    etudiants = VagueStudentSerializer(source='utilisateurvague_set', many=True, read_only=True)
    
    # 🌟 1. On utilise le nouveau champ 'quizzes' pour obtenir la liste des IDs directement
    quiz_assignes_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        read_only=True, 
        source='quizzes'
    )
    
    quizzes_assignes = serializers.SerializerMethodField()

    class Meta:
        model = Vague
        fields = ['id', 'nom_vague', 'formation_id', 'formation_nom', 'debut', 'fin', 'etudiants', 'quiz_assignes_ids', 'quizzes_assignes']

    def get_quizzes_assignes(self, obj):
        # 🌟 2. On lit directement le programme officiel de la Vague (Curriculum)
        # Plus besoin de requêter UtilisateurQuiz !
        quizzes = obj.quizzes.all()
        
        return [
            {
                "id": q.id,
                "titre": q.titre or f"Quiz #{q.id}",
                "status": q.status
            } for q in quizzes
        ]