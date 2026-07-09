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
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('quiz', 'utilisateur')

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
    # Stores the actual answer the user chose or typed
    user_valiny = models.TextField(help_text="La réponse choisie ou saisie par l'apprenant")
    corrigee = models.ForeignKey(Corrigee, on_delete=models.CASCADE)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pts = models.FloatField(default=0.0)
    vrai_ou_faux = models.BooleanField()


    def __str__(self):
        return f"Réponse donnée : {self.user_valiny[:50]} - ({self.vrai_ou_faux})"