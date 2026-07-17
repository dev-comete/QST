from django.urls import path
from .views import CreateVagueAPIView, AssignStudentToVagueAPIView

urlpatterns = [
    path('vagues/create/', CreateVagueAPIView.as_view(), name='create-vague'),
    path('vagues/assign-student/', AssignStudentToVagueAPIView.as_view(), name='assign-student-vague'),
]