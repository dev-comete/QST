from rest_framework import serializers

class ImportQuestionsSerializer(serializers.Serializer):
    fichier = serializers.FileField(
        required=False,
        help_text="Uploadez un document (PDF, DOCX, TXT) contenant vos questions."
    )
    texte = serializers.CharField(
        required=False,
        style={'base_template': 'textarea.html'}, # Affiche un grand champ de texte dans l'interface DRF
        help_text="Ou collez directement votre texte brut ici."
    )

    def validate(self, data):
        # Validation personnalisée : Il faut au moins un des deux champs !
        if not data.get('fichier') and not data.get('texte'):
            raise serializers.ValidationError("Vous devez fournir soit un fichier, soit du texte brut.")
        return data