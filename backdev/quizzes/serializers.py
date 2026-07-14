from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Quiz, Question, Reponse, Corrigee , UtilisateurQuiz , TypeQuestion , Bareme, QuestionTypeQuestion , QuestionBareme , QuizQuestion

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

class TypeQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeQuestion
        fields = '__all__'

class BaremeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bareme
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
# 1. Keep the IDs (Frontend might still need them for state management)
    quiz_id = serializers.IntegerField(source='quiz.id', read_only=True)
    question_id = serializers.IntegerField(source='question.id', read_only=True)
    type_id = serializers.IntegerField(source='type_question.id', read_only=True)
    bareme_id = serializers.IntegerField(source='bareme.id', read_only=True)

    # 2. Reach into the foreign keys to grab the human-readable text
    enonce_question = serializers.CharField(source='question.enonce_question', read_only=True)
    
    # Note: Replace 'nom_type' with whatever your TypeQuestion model uses (e.g., 'nom', 'libelle')
    type_nom = serializers.CharField(source='type_question.type_question', read_only=True) 
    
    # Note: Replace 'valeur' with whatever your Bareme model uses (e.g., 'points', 'score')
    points = serializers.FloatField(source='bareme.pts', read_only=True)
    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'quiz_id',
            'question_id',
            'enonce_question',
            'type_id',
            'type_nom',
            'bareme_id',
            'points'
        ]

class QuestionTypeQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionTypeQuestion
        fields = '__all__'

class QuestionBaremeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBareme
        fields = '__all__'

class QuestionChoiceSerializer(serializers.Serializer):
    """
    Sub-serializer to define the exact configuration of the chosen question.
    """
    question_id = serializers.IntegerField(required=True)
    type_id = serializers.IntegerField(required=True)
    bareme_id = serializers.IntegerField(required=True)

class AssignQuestionsSerializer(serializers.Serializer):
    """
    Main serializer for assigning questions to a quiz.
    """
    quiz_id = serializers.IntegerField(required=True)
    
    # We completely replace 'question_ids' with this new field
    questions_choisies = QuestionChoiceSerializer(
        many=True, 
        allow_empty=False,
        help_text="Liste détaillée des questions avec le type et le barème spécifiques choisis."
    )

class ReponseOptionSerializer(serializers.Serializer):
    reponse = serializers.CharField(max_length=500)
    est_correct = serializers.BooleanField(
        default=False, 
        help_text="Cochez si cette réponse est la bonne (pour le corrigé)"
    )

class CreateFullQuestionSerializer(serializers.Serializer):
    enonce_question = serializers.CharField()
    type_id = serializers.IntegerField(required=True)
    bareme_id = serializers.IntegerField(required=True)
    
    # Nested list of all options (right and wrong) the formateur provided
    options = ReponseOptionSerializer(many=True, allow_empty=True, required=False)

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