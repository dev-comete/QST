from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import TypeUtilisateur

User = get_user_model()

class TypeUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeUtilisateur
        # Matches your exact field name
        fields = ['id', 'type_utilisateur']

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Include your custom field 'type_utilisateur' here!
        fields = ['id', 'username', 'email', 'password', 'type_utilisateur'] 
        
        # This guarantees the API will NEVER return the password in a response
        extra_kwargs = {
            'password': {'write_only': True, 'required': False} 
        }

    def create(self, validated_data):
        """Override create to hash the password securely."""
        # We extract the password from the dictionary
        password = validated_data.pop('password', None)
        
        # Create the user without the password first
        user = super().create(validated_data)
        
        # Hash and set the password if one was provided
        if password:
            user.set_password(password)
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