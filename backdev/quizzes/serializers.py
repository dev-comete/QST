from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Quiz, Question, Reponse, Corrigee , UtilisateurQuiz , TypeQuestion , Bareme, QuestionTypeQuestion , QuestionBareme , QuizQuestion

from accounts.models import Utilisateur

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

class FormateurOptionSerializer(serializers.ModelSerializer):
    reponse_id = serializers.IntegerField(source='reponse.id', read_only=True)
    texte = serializers.CharField(source='reponse.reponse', read_only=True)
    # Include 'est_correct' since this view seems to be for the Formateur/Admin
    est_correct = serializers.BooleanField(read_only=True) 

    explication = serializers.CharField(read_only=True)

    class Meta:
        model = Corrigee
        fields = ['reponse_id', 'texte', 'est_correct', 'explication']

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

    options = serializers.SerializerMethodField()

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
            'points', 
            'options'
        ]
    def get_options(self, obj):
        # 1. If it is an open question, return an empty array
        # Adjust 'ouverte' to match exactly how it is spelled in your database
        if 'ouverte' in obj.type_question.type_question.lower():
            return []
            
        # 2. Otherwise, fetch the Corrigee rows linked to this specific Question
        corrigees = Corrigee.objects.filter(question=obj.question)
        
        # 3. Pass them through our mini-serializer
        return FormateurOptionSerializer(corrigees, many=True).data

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

    explication = serializers.CharField(
        allow_blank=True, 
        required=False,
        help_text="Explication affichée pour ce choix spécifique lors de la correction."
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
    quiz_id = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all()
    )
    # This creates a dropdown of all Students in the UI
    etudiant_id = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.all()
    )

    def validate_etudiant_id(self, value):
            """Ensure the user is actually a student."""
            # 'value' is ALREADY the full Utilisateur object! 
            # No need for User.objects.get() or try/except blocks.
            
            if not value.type_utilisateur or value.type_utilisateur.type_utilisateur != 'apprenant':
                raise serializers.ValidationError("Cet utilisateur n'est pas un apprenant.")
                
            return value

class ApprenantQuizListSerializer(serializers.ModelSerializer):
    # Fetch details from the related Quiz
    quiz_id = serializers.IntegerField(source='quiz.id', read_only=True)
    quiz_titre = serializers.CharField(source='quiz.titre', read_only=True)
    formation_nom = serializers.CharField(source='quiz.formation.nom_formation', read_only=True)

    class Meta:
        model = UtilisateurQuiz
        fields = [
            'quiz_id', 
            'quiz_titre', 
            'formation_nom', 
            'termine', 
            'score_obtenu'
        ]

class StudentOptionSerializer(serializers.ModelSerializer):
    """
    Pulls data from the Corrigee link, but exposes the underlying Reponse ID 
    so the student can submit it later. We STILL hide 'est_correct'!
    """
    # Fetch the ID and text from the linked Reponse model
    id = serializers.IntegerField(source='reponse.id', read_only=True)
    reponse = serializers.CharField(source='reponse.reponse', read_only=True)

    class Meta:
        model = Corrigee
        fields = ['id', 'reponse'] 

class StudentQuizQuestionSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source='question.id', read_only=True)
    enonce = serializers.CharField(source='question.enonce_question', read_only=True)
    options = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = ['question_id', 'enonce', 'type_question', 'bareme_id', 'options']

    def get_options(self, obj):
        # We query Corrigee instead of ReponseOption
        options = Corrigee.objects.filter(question=obj.question)
        return StudentOptionSerializer(options, many=True).data