from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ( 
    QuizViewSet, 
    QuestionViewSet, 
    ReponseViewSet, 
    SubmitQuizAPIView , AssignStudentAPIView, MyTodoQuizzesAPIView , AssignQuestionsAPIView , TypeQuestionViewSet, 
    BaremeViewSet, 
    QuestionTypeQuestionViewSet, 
    QuestionBaremeViewSet , CreateFullQuestionAPIView , QuizQuestionViewSet
)
from formations.views import FormationViewSet
from accounts.views import UtilisateurViewSet, TypeUtilisateurViewSet

router = DefaultRouter()

# 2. Register the CRUD endpoints
router.register(r'formations', FormationViewSet, basename='formation')
router.register(r'types-utilisateurs', TypeUtilisateurViewSet, basename='type-utilisateur')
router.register(r'utilisateurs',UtilisateurViewSet, basename='utilisateur')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'reponses', ReponseViewSet, basename='reponse')
router.register(r'baremes', BaremeViewSet, basename='bareme')

router.register(r'types-questions', TypeQuestionViewSet, basename='typequestion')
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quizquestion')

router.register(r'assigner-types', QuestionTypeQuestionViewSet, basename='assigner-types')
router.register(r'assigner-baremes', QuestionBaremeViewSet, basename='assigner-baremes')

urlpatterns = [

    path('api-auth/', include('rest_framework.urls')),

    path('crud/', include(router.urls)),

    path('questions/create-full/', CreateFullQuestionAPIView.as_view(), name='create-full-question'),

    path('my-quiz-student/', MyTodoQuizzesAPIView.as_view(), name='api-my-todo-quizzes'),

    path('assign-questions/', AssignQuestionsAPIView.as_view(), name='api-assign-questions'),

    path('assign-student/', AssignStudentAPIView.as_view(), name='api-assign-quiz'),

    path('student-submit/', SubmitQuizAPIView.as_view(), name='api-submit-quiz'),
]