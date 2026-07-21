from django.conf import settings
from django.db import models

class Quiz(models.Model):
    # Represents Sous dossier/Quiz
    formation = models.ForeignKey('formations.Formation', on_delete=models.CASCADE)
    date_creation_quiz = models.DateTimeField(auto_now_add=True)
    duree = models.DurationField(help_text="Durée allouée pour le quiz")
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"Quiz {self.id} - {self.formation.nom_formation}"

class Question(models.Model):
    enonce_question = models.TextField()

    def __str__(self):
        return self.enonce_question[:50]

class TypeQuestion(models.Model):
    type_question = models.CharField(max_length=100)

    code = models.CharField(
        max_length=10, 
        unique=True, 
        null=True,
        help_text="Code système immuable (ex: QCU, QCM, OUV)"
    )

    def __str__(self):
        return f"{self.type_question} ({self.code})"

class Reponse(models.Model):
    reponse = models.TextField()

    def __str__(self):
        return self.reponse[:50]

class Bareme(models.Model):
    pts = models.FloatField()

    def __str__(self):
        return f"{self.pts} pts"

class UtilisateurQuiz(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    
    # We add these fields to track the final result
    score_obtenu = models.FloatField(default=0.0)
    termine = models.BooleanField(default=False)
    date_assignation = models.DateTimeField(auto_now_add=True)

    heure_debut = models.DateTimeField(null=True, blank=True, help_text="Heure à laquelle l'étudiant a commencé le quiz")

    class Meta:
        unique_together = ('quiz', 'utilisateur')

    def __str__(self):
        return f"{self.utilisateur.username} - {self.quiz.id} - Score: {self.score_obtenu}"

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    type_question = models.ForeignKey(TypeQuestion, on_delete=models.CASCADE)
    bareme = models.ForeignKey(Bareme, on_delete=models.CASCADE)

    class Meta:
            # A quiz can't have the exact same question/type/bareme combo twice
        unique_together = ('quiz', 'question', 'type_question', 'bareme')
            
    def __str__(self):
        return f"{self.quiz.id} | {self.question.id} ({self.type_question} - {self.bareme})"

class QuestionTypeQuestion(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    type_question = models.ForeignKey(TypeQuestion, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('question', 'type_question')

class Corrigee(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    reponse = models.ForeignKey(Reponse, on_delete=models.CASCADE)

    est_correct = models.BooleanField(
        default=False,
        help_text="Cochez si cette réponse est la bonne."
    )

    explication = models.TextField(
        blank=True, 
        null=True,
        help_text="Explication affichée pour ce choix spécifique lors de la correction."
    )

    class Meta:
        unique_together = ('question', 'reponse')

    def __str__(self):
        status = "Correct" if self.est_correct else "Faux"
        return f"Q{self.question.id} - {self.reponse.reponse[:20]} ({status})"

class QuestionBareme(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    bareme = models.ForeignKey(Bareme, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('question', 'bareme')

class Valiny(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey('Question', on_delete=models.CASCADE)
    
    # M2M links the user's attempt to the predefined Reponse objects
    reponses_choisies = models.ManyToManyField(
        'Reponse', 
        blank=True,
        help_text="Les options sélectionnées par l'apprenant pour les QCM/QCU"
    )
    
    # We keep a text field for open-ended questions (if needed later)
    reponse_ouverte = models.TextField(blank=True, null=True)

    pts = models.FloatField(default=0.0)
    vrai_ou_faux = models.BooleanField(default=False)

    def __str__(self):
        return f"Valiny: {self.utilisateur.username} - Q: {self.question.id}"