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

    def __str__(self):
        return self.type_question

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
    date_tentative = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('quiz', 'utilisateur')

    def __str__(self):
        return f"{self.utilisateur.username} - {self.quiz.id} - Score: {self.score_obtenu}"

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('quiz', 'question')

class QuestionTypeQuestion(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    type_question = models.ForeignKey(TypeQuestion, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('question', 'type_question')

class Corrigee(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    reponse = models.ForeignKey(Reponse, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('question', 'reponse')

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