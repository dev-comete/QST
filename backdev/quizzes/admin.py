from django.contrib import admin
from .models import (
    Question,
    Corrigee,
    TypeQuestion,
    Quiz,
    QuizQuestion,
    UtilisateurQuiz,
    Valiny
)

class CorrigeeInline(admin.TabularInline):
    model = Corrigee
    extra = 1

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'enonce_question', 'organisation', 'is_active')
    list_filter = ('is_active', 'organisation')
    search_fields = ('enonce_question',)
    inlines = [CorrigeeInline]

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'titre', 'status', 'is_active', 'date_ouverture', 'date_fermeture')
    list_filter = ('status', 'is_active')
    search_fields = ('titre',)

@admin.register(TypeQuestion)
class TypeQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'code')

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'question', 'type_question', 'bareme')

@admin.register(UtilisateurQuiz)
class UtilisateurQuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'utilisateur', 'quiz', 'vague', 'score_obtenu', 'date_assignation', 'termine', 'heure_debut')
    list_filter = ('vague', 'quiz')

@admin.register(Valiny)
class ValinyAdmin(admin.ModelAdmin):
    list_display = ('id', 'utilisateur', 'question', 'quiz', 'vague', 'pts', 'vrai_ou_faux')