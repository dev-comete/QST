from django.urls import path
from .views import CreateVagueAPIView, AssignStudentToVagueAPIView , AssignQuizToVagueAPIView , VagueListAPIView, MesVaguesAPIView , RemoveStudentFromVagueAPIView , RemoveQuizFromVagueAPIView

urlpatterns = [
    path('vagues/', VagueListAPIView.as_view(), name='vague-list-students'),
    path('vagues/create/', CreateVagueAPIView.as_view(), name='create-vague'),
    path('vagues/assign-student/', AssignStudentToVagueAPIView.as_view(), name='assign-student-vague'),
    path('vagues/assign-quiz/', AssignQuizToVagueAPIView.as_view(), name='assign-quiz-vague'),
    path('vagues/remove-student/', RemoveStudentFromVagueAPIView.as_view(), name='remove-student-vague'),
    path('vagues/remove-quiz/', RemoveQuizFromVagueAPIView.as_view(), name='remove-quiz-vague'),
    path('student/mes-vagues/', MesVaguesAPIView.as_view(), name='student-mes-vagues'),
]