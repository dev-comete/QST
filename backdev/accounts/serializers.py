import secrets
import string
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import TypeUtilisateur, Organisation

User = get_user_model()

class OrganisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = ['id', 'nom', 'date_creation', 'is_active']
        read_only_fields = ['id', 'date_creation']

class TypeUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeUtilisateur
        # Matches your exact field name
        fields = ['id', 'type_utilisateur']

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Include your custom field 'type_utilisateur' here!
        fields = ['id', 'username', 'email', 'type_utilisateur', 'organisation'] 
        
        # This guarantees the API will NEVER return the password in a response
        #extra_kwargs = {
        #    'password': {'write_only': True, 'required': False} 
        #}

    def create(self, validated_data):
        #"""Override create to hash the password securely."""
        # We extract the password from the dictionary
        #password = validated_data.pop('password', None)
        
        # Create the user without the password first
        user = super().create(validated_data)

        alphabet = string.ascii_letters + string.digits + string.punctuation
        random_password = ''.join(secrets.choice(alphabet) for i in range(16))
        
        # 3. On le hashe et on le sauvegarde
        user.set_password(random_password)
        user.save()
            
        return user

    def update(self, instance, validated_data):
        """Override update to handle password changes safely."""
        password = validated_data.pop('password', None)
        
        # Update the normal fields (username, email, type_utilisateur)
        instance = super().update(instance, validated_data)
        
        # Only update the password if the admin actually typed a new one
        if password:
            instance.set_password(password)
            instance.save()
            
        return instance