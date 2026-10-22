import threading
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from quizzes.permissions import IsAdminUser
from .models import PasswordResetRequest
from .serializers_auth import (
    CustomLoginSerializer,
    PasswordResetRequestSerializer,
    ResetPasswordConfirmSerializer,
)

User = get_user_model()


class EmailThread(threading.Thread):
    """Envoie l'e-mail dans un thread séparé pour éviter de bloquer l'API."""
    def __init__(self, subject, message, from_email, recipient_list):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)

    def run(self):
        try:
            send_mail(
                self.subject,
                self.message,
                self.from_email,
                self.recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f" Erreur lors de l'envoi de l'e-mail en arrière-plan : {e}")


class CustomLoginAPIView(TokenObtainPairView):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token to prove the authentication of those credentials, along with user details.
    """
    serializer_class = CustomLoginSerializer


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ConfirmPasswordResetAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Mot de passe défini avec succès. Vous pouvez maintenant vous connecter."}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Ce lien d'activation est invalide ou a déjà été utilisé."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SubmitPasswordResetRequestView(APIView):
    """
    Point d'entrée sécurisé pour qu'un utilisateur authentifié (non-admin) 
    demande la réinitialisation de son mot de passe.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email') or request.user.email
        if not email:
            return Response({'detail': "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({'detail': 'Si cette adresse existe, une demande a été envoyée.'}, status=status.HTTP_200_OK)

        if user.is_staff or user.is_superuser or (user.type_utilisateur and user.type_utilisateur.type_utilisateur == 'admin'):
            return Response({'detail': 'Les administrateurs ne peuvent pas utiliser ce formulaire.'}, status=status.HTTP_403_FORBIDDEN)

        if PasswordResetRequest.objects.filter(user=user, status='pending').exists():
            return Response({'detail': 'Une demande est déjà en attente pour ce compte.'}, status=status.HTTP_400_BAD_REQUEST)

        PasswordResetRequest.objects.create(user=user)
        return Response({'detail': "Demande de réinitialisation envoyée à l'administrateur."}, status=status.HTTP_201_CREATED)


class AdminPasswordResetViewSet(viewsets.ModelViewSet):
    """
    Interface réservée aux Administrateurs pour valider ou rejeter 
    les demandes de réinitialisation de mot de passe.
    """
    permission_classes = [IsAdminUser]
    serializer_class = PasswordResetRequestSerializer
    queryset = PasswordResetRequest.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        req_status = self.request.query_params.get('status')
        if req_status:
            queryset = queryset.filter(status=req_status)
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reset_req = self.get_object()
        
        if reset_req.status != 'pending':
            return Response({'detail': 'Cette demande a déjà été traitée.'}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_req.user
        if not user:
            return Response({'detail': 'Utilisateur introuvable pour cette demande.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Création du Token sécurisé
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/set-password/{uid}/{token}"

        # 2. Préparation de l'e-mail
        subject = "Réinitialisation de votre mot de passe QST"
        message = (
            f"Bonjour {user.username},\n\n"
            f"Votre demande de réinitialisation de mot de passe a été approuvée par un administrateur.\n"
            f"Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :\n\n"
            f"{reset_link}\n\n"
            f"Si vous n'avez pas fait cette demande, veuillez contacter un administrateur immédiatement.\n\n"
            f"À bientôt !"
        )
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', getattr(settings, 'EMAIL_HOST_USER', 'noreply@comete.ai'))

        # Envoi asynchrone pour une réponse HTTP immédiate côté Admin
        EmailThread(subject, message, from_email, [user.email]).start()

        # 3. Clôture de la requête en base de données
        reset_req.status = 'approved'
        reset_req.resolved_at = timezone.now()
        reset_req.resolved_by = request.user
        reset_req.save()

        return Response({
            'detail': "Demande approuvée. Un e-mail contenant le lien de réinitialisation est en cours d'envoi à l'utilisateur.",
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reset_req = self.get_object()
        
        if reset_req.status != 'pending':
            return Response({'detail': 'Cette demande a déjà été traitée.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_req.status = 'rejected'
        reset_req.resolved_at = timezone.now()
        reset_req.resolved_by = request.user
        reset_req.save()

        return Response({'detail': 'Demande rejetée avec succès.'}, status=status.HTTP_200_OK)