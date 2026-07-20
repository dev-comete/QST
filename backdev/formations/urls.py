from django.urls import path
from .views import CreateVagueAPIView, AssignStudentToVagueAPIView , AssignQuizToVagueAPIView

urlpatterns = [
    path('vagues/create/', CreateVagueAPIView.as_view(), name='create-vague'),
    path('vagues/assign-student/', AssignStudentToVagueAPIView.as_view(), name='assign-student-vague'),
    path('vagues/assign-quiz/', AssignQuizToVagueAPIView.as_view(), name='assign-quiz-vague'),
]