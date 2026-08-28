from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ( 
    QuizViewSet, 
    QuestionViewSet, 
    ReponseViewSet, 
    SubmitQuizAPIView , AssignStudentAPIView, MyTodoQuizzesAPIView , AssignQuestionsAPIView , TypeQuestionViewSet, 
    BaremeViewSet, 
    QuestionTypeQuestionViewSet, 
    QuestionBaremeViewSet , CreateFullQuestionAPIView , QuizQuestionViewSet , ApprenantQuizListAPIView , TakeQuizAPIView , QuizReviewAPIView , QuestionBankSearchAPIView, RemoveQuestionFromQuizAPIView , QuizAssignedQuestionsListAPIView
)

from .views_analytics import FormateurVagueAnalyticsAPIView , ApprenantBulletinAPIView
from .views_pdf import ApprenantBulletinPDFAPIView
from .views_corbeille import CorbeilleQuizAPIView, CorbeilleQuestionAPIView
from .views_dashboard import FormateurDashboardMetricsAPIView

from formations.views import FormationViewSet
from accounts.views import UtilisateurViewSet, TypeUtilisateurViewSet, OrganisationViewSet

router = DefaultRouter()

# 2. Register the CRUD endpoints
router.register(r'organisations', OrganisationViewSet, basename='organisation')
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

    path('api-auth/', include('rest_framework.urls')), # just for browsable API login/logout

    path('crud/', include(router.urls)),

    path('questions/create-full/', CreateFullQuestionAPIView.as_view(), name='create-full-question'),

    path('mes-quiz/', ApprenantQuizListAPIView.as_view(), name='mes-quiz'),

    path('assign-questions/', AssignQuestionsAPIView.as_view(), name='api-assign-questions'),

    path('assign-student/', AssignStudentAPIView.as_view(), name='api-assign-quiz'),

    path('<int:quiz_id>/take/', TakeQuizAPIView.as_view(), name='take-quiz'),

    path('student-submit/', SubmitQuizAPIView.as_view(), name='api-submit-quiz'),

    path('<int:quiz_id>/review/', QuizReviewAPIView.as_view(), name='quiz-review'),

    path('analytics/vague/<int:vague_id>/', FormateurVagueAnalyticsAPIView.as_view(), name='vague-analytics'),

    path('banque-questions/', QuestionBankSearchAPIView.as_view(), name='banque-questions-search'),

    path('bulletin/vague/<int:vague_id>/', ApprenantBulletinAPIView.as_view(), name='apprenant-bulletin'),

    path('bulletin/vague/<int:vague_id>/pdf/', ApprenantBulletinPDFAPIView.as_view(), name='apprenant-bulletin-pdf'),

    path('remove-question/<int:quiz_id>/<int:question_id>/', RemoveQuestionFromQuizAPIView.as_view(), name='remove_quiz_question'),

    path(
        '<int:quiz_id>/questions/', 
        QuizAssignedQuestionsListAPIView.as_view(), 
        name='quiz-assigned-questions'
    ),

    # Routes pour lister la corbeille
    path('corbeille/quizzes/', CorbeilleQuizAPIView.as_view(), name='corbeille-quizzes'),
    path('corbeille/questions/', CorbeilleQuestionAPIView.as_view(), name='corbeille-questions'),

    # Routes pour la restauration (POST avec l'ID pour restaurer)
    path('corbeille/quizzes/<int:quiz_id>/restaurer/', CorbeilleQuizAPIView.as_view(), name='restaurer-quiz'),
    path('corbeille/questions/<int:question_id>/restaurer/', CorbeilleQuestionAPIView.as_view(), name='restaurer-question'),

    path('dashboard/metrics/', FormateurDashboardMetricsAPIView.as_view(), name='dashboard-metrics')

]