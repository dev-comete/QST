"""
INPUT VALIDATION (HTTP level only): cheap checks before any reading or AI call.
"""
import os

from rest_framework import serializers

from .config import conf
from .readers import SUPPORTED_EXTENSIONS


class ImportQuestionsSerializer(serializers.Serializer):
    fichier = serializers.FileField(
        required=False,
        help_text=f"Document ({', '.join(SUPPORTED_EXTENSIONS)}) contenant vos questions.",
    )
    texte = serializers.CharField(
        required=False,
        style={"base_template": "textarea.html"},
        help_text="Ou collez directement votre texte brut ici.",
    )

    def validate_fichier(self, upload):
        extension = os.path.splitext(upload.name or "")[1].lower()
        if extension not in SUPPORTED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Format non supporté. Formats acceptés : {', '.join(SUPPORTED_EXTENSIONS)}."
            )
        limit = conf().max_file_bytes
        if upload.size > limit:
            raise serializers.ValidationError(
                f"Fichier trop volumineux (max {limit // (1024 * 1024)} Mo)."
            )
        return upload

    def validate(self, data):
        has_file = bool(data.get("fichier"))
        has_text = bool(data.get("texte"))
        if has_file == has_text:        # both or neither
            raise serializers.ValidationError(
                "Fournissez soit un fichier, soit du texte brut (pas les deux)."
            )
        return data
