from rest_framework import serializers
from .models import Quiz, Question, Reponse, Corrigee

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

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    # Expects a payload like: {"question_id": 5, "submitted_reponse_ids": [12, 14]}
    submitted_reponse_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )

from rest_framework import serializers

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