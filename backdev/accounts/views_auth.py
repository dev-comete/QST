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
from .invitation_email import send_invitation_email
from .models import PasswordResetRequest
from notifications.models import Notification
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

def notify_admins_of_reset_request(user):
    """
    Récupère tous les administrateurs et leur envoie un e-mail 
    en arrière-plan via EmailThread.
    """
    # Récupérer les emails de tous les admins (is_staff=True)
    admin_emails = list(User.objects.filter(is_staff=True).exclude(email='').values_list('email', flat=True))
    
    if not admin_emails:
        return

    subject = "C-eval, Nouvelle demande de réinitialisation de mot de passe"
    message = (
        f"Bonjour,\n\n"
        f"L'utilisateur {user.username} ({user.email}) a soumis une demande de réinitialisation "
        f"de son mot de passe.\n\n"
        f"Veuillez vous connecter au tableau de bord administrateur de la plateforme "
        f"pour approuver ou rejeter cette demande.\n\n"
        f"Cordialement,\n"
        f"Le système QST."
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@comete.ai')
    
    # Utilisation de votre thread existant pour ne pas bloquer l'API
    EmailThread(subject, message, from_email, admin_emails).start()

    admins = User.objects.filter(is_staff=True)
    Notification.objects.bulk_create([
        Notification(
            destinataire=admin,
            titre="Demande de réinitialisation",
            message=f"{user.username} a demandé une réinitialisation.",
            type_notif="password_reset"
        ) for admin in admins
    ])


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
        notify_admins_of_reset_request(user)
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

        # Envoi asynchrone du mail standardisé de réinitialisation de mot de passe
        threading.Thread(
            target=send_invitation_email,
            args=(user,),
            kwargs={'is_reset': True},
            daemon=True,
        ).start()

        # Clôture de la requête en base de données
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

class PublicPasswordResetRequestView(APIView):
    """
    Point d'entrée public pour demander un nouveau lien de réinitialisation.
    Utilisé lorsqu'un lien a expiré et que l'utilisateur n'est pas connecté.
    """
    permission_classes = [AllowAny] # Doit être accessible sans token !

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'detail': "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)

        # On cherche l'utilisateur par son email
        user = User.objects.filter(email=email).first()
        
        # Sécurité : On ne révèle pas si l'email existe ou non pour éviter le "user enumeration"
        if not user:
            return Response(
                {'detail': "Si cette adresse existe dans notre système, une nouvelle demande a été envoyée aux administrateurs."}, 
                status=status.HTTP_200_OK
            )

        # Les administrateurs ne doivent pas utiliser ce flux
        if user.is_staff or user.is_superuser or (user.type_utilisateur and user.type_utilisateur.type_utilisateur == 'admin'):
             return Response(
                 {'detail': "Si cette adresse existe dans notre système, une nouvelle demande a été envoyée aux administrateurs."}, 
                 status=status.HTTP_200_OK
             )

        # On vérifie s'il y a déjà une demande en attente pour éviter le spam
        if PasswordResetRequest.objects.filter(user=user, status='pending').exists():
            return Response(
                {'detail': 'Une demande de réinitialisation est déjà en attente de validation pour ce compte.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # On crée la demande qui apparaîtra dans le dashboard admin
        PasswordResetRequest.objects.create(user=user)
        notify_admins_of_reset_request(user)
        
        return Response(
            {'detail': "Votre demande a été envoyée aux administrateurs. Vous recevrez un nouveau lien par e-mail une fois validée."}, 
            status=status.HTTP_201_CREATED
        )

class VerifyPasswordResetTokenAPIView(APIView):
    """
    Vérifie simplement si le couple uid/token est toujours valide 
    sans modifier le mot de passe.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Ce lien d'activation est invalide."}, status=status.HTTP_400_BAD_REQUEST)

        # check_token ne consomme pas le token, il fait juste le vérifier mathématiquement
        if user is not None and default_token_generator.check_token(user, token):
            return Response({"detail": "Lien valide."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Ce lien d'activation a expiré."}, status=status.HTTP_400_BAD_REQUEST)