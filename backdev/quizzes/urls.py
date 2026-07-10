from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ( 
    QuizViewSet, 
    QuestionViewSet, 
    ReponseViewSet, 
    SubmitQuizAPIView , AssignStudentAPIView, MyTodoQuizzesAPIView
)
from formations.views import FormationViewSet

router = DefaultRouter()

# 2. Register the CRUD endpoints
router.register(r'formations', FormationViewSet, basename='formation')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'reponses', ReponseViewSet, basename='reponse')

urlpatterns = [
    path('crud/', include(router.urls)),

    path('my-quiz-student/', MyTodoQuizzesAPIView.as_view(), name='api-my-todo-quizzes'),

    path('quizzes/assign/', AssignStudentAPIView.as_view(), name='api-assign-quiz'),

    path('quizzes/submit/', SubmitQuizAPIView.as_view(), name='api-submit-quiz'),
]