from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Quiz, Question, Reponse, Corrigee , UtilisateurQuiz

User = get_user_model()

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reponse
        fields = '__all__'

class StudentTodoQuizSerializer(serializers.ModelSerializer):
    # We use 'source' to easily reach into the related Quiz and Formation models
    formation_nom = serializers.CharField(source='quiz.formation.nom_formation', read_only=True)
    duree = serializers.DurationField(source='quiz.duree', read_only=True)
    
    class Meta:
        model = UtilisateurQuiz
        fields = ['id', 'quiz', 'formation_nom', 'duree', 'date_tentative', 'termine']

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    # Expects a payload like: {"question_id": 5, "submitted_reponse_ids": [12, 14]}
    submitted_reponse_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )


class QuizSubmissionSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField(
        required=True, 
        help_text="L'ID du quiz que l'apprenant soumet."
    )
    
    # This expects a dictionary where keys are Question IDs (strings in JSON) 
    # and values are lists of Reponse IDs (integers).
    # Example: {"10": [2, 3], "11": [5], "12": []}
    answers = serializers.DictField(
        child=serializers.ListField(
            child=serializers.IntegerField(),
            allow_empty=True
        ),
        required=True,
        help_text="Dictionnaire des réponses. Clé = ID Question, Valeur = Liste d'IDs Réponses."
    )

class AssignStudentSerializer(serializers.Serializer):
    etudiant_id = serializers.IntegerField(required=True)
    quiz_id = serializers.IntegerField(required=True)

    def validate_etudiant_id(self, value):
        """Ensure the ID belongs to a real user who is actually a student."""
        try:
            user = User.objects.get(id=value)
            if getattr(user, 'type_utilisateur', '') != 'apprenant':
                raise serializers.ValidationError("Cet utilisateur n'est pas un apprenant.")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Étudiant introuvable.")