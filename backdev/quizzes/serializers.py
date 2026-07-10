from rest_framework import serializers

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    # Expects a payload like: {"question_id": 5, "submitted_reponse_ids": [12, 14]}
    submitted_reponse_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )