# ia/urls.py
from django.urls import path
from .views import TestGeminiAPIView, GenerateDistractorsAPIView, ImportQuestionsIAAPIView
from .import_question.views import ImportQuestionsv2APIView

urlpatterns = [
    path('test-connexion/', TestGeminiAPIView.as_view(), name='test_gemini'),
    path('distracteurs/', GenerateDistractorsAPIView.as_view(), name='generer_distracteurs'),
    path("import-questions/", ImportQuestionsv2APIView.as_view(), name="import_questions"),
]