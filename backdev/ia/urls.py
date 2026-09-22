# ia/urls.py
from django.urls import path
from .views import TestGeminiAPIView, GenerateDistractorsAPIView, ImportQuestionsIAAPIView

urlpatterns = [
    path('test-connexion/', TestGeminiAPIView.as_view(), name='test_gemini'),
    path('distracteurs/', GenerateDistractorsAPIView.as_view(), name='generer_distracteurs'),
    path('import-IA-question/', ImportQuestionsIAAPIView.as_view(), name='import_AI_question'),
]