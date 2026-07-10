from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ( 
    QuizViewSet, 
    QuestionViewSet, 
    ReponseViewSet, 
    SubmitQuizAPIView
)
from formations.views import FormationViewSet

router = DefaultRouter()

# 2. Register the CRUD endpoints
router.register(r'formations', FormationViewSet, basename='formation')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'reponses', ReponseViewSet, basename='reponse')

urlpatterns = [
    path('', include(router.urls)),

    path('api/quizzes/submit/', SubmitQuizAPIView.as_view(), name='api-submit-quiz'),
]