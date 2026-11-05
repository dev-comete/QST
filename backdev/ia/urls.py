# ia/urls.py
from django.urls import path
from .views import TestGeminiAPIView, GenerateDistractorsAPIView, ImportQuestionsIAAPIView
from .import_question.views import ImportQuestionsv2APIView
from .ollama_view import TestOllamaAPIView
from .import_question.manual_views import ManualImportQuestionsAPIView

urlpatterns = [
    path('test-connexion/', TestGeminiAPIView.as_view(), name='test_gemini'),
    path('test-ollama/', TestOllamaAPIView.as_view(), name='test_ollama'),
    path('distracteurs/', GenerateDistractorsAPIView.as_view(), name='generer_distracteurs'),
    path("import-questions/", ImportQuestionsv2APIView.as_view(), name="import_questions"),
    path("import-questions/manual/", ManualImportQuestionsAPIView.as_view(), name="import-questions-manual"),
    
]