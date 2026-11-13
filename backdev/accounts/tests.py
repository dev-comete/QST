from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import TypeUtilisateur

User = get_user_model()


class UtilisateurSoftDeleteTests(APITestCase):
    def setUp(self):
        admin_type = TypeUtilisateur.objects.create(type_utilisateur='admin')
        user_type = TypeUtilisateur.objects.create(type_utilisateur='formateur')
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='test-password',
            type_utilisateur=admin_type,
        )
        self.user = User.objects.create_user(
            username='inactive-user',
            email='inactive@example.com',
            password='test-password',
            type_utilisateur=user_type,
        )
        self.client.force_authenticate(user=self.admin)

    def test_delete_deactivates_user_instead_of_removing_it(self):
        response = self.client.delete(
            reverse('utilisateur-detail', kwargs={'pk': self.user.pk})
        )

        self.assertEqual(response.status_code, 204)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

        list_response = self.client.get(reverse('utilisateur-list'))
        self.assertEqual(list_response.status_code, 200)
        listed_user = next(
            user for user in list_response.data if user['id'] == self.user.pk
        )
        self.assertFalse(listed_user['is_active'])
