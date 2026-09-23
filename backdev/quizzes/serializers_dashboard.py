# quizzes/dashboard_serializers.py
from rest_framework import serializers

class StatItemSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()
    change = serializers.CharField()
    tone = serializers.CharField()
    # 🌟 NOUVEAU : On autorise le champ link (qui peut être null pour le taux de réussite)
    link = serializers.CharField(allow_null=True, required=False)

class RecentQuizSerializer(serializers.Serializer):
    # 🌟 NOUVEAU : On ajoute l'ID du quiz
    id = serializers.IntegerField()
    name = serializers.CharField()
    completion = serializers.CharField()
    status = serializers.CharField()

class UpcomingSessionSerializer(serializers.Serializer):
    # 🌟 NOUVEAU : On ajoute l'ID de la vague/session
    id = serializers.IntegerField()
    name = serializers.CharField()
    date = serializers.CharField()

class DashboardMetricsSerializer(serializers.Serializer):
    stats = StatItemSerializer(many=True)
    
    # "source" indique à DRF de lire la clé Python 'recent_quizzes' 
    # mais de l'exposer sous le nom 'recentQuizzes' pour React !
    recentQuizzes = RecentQuizSerializer(source='recent_quizzes', many=True)
    upcomingSessions = UpcomingSessionSerializer(source='upcoming_sessions', many=True)