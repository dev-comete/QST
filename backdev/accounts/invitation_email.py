from html import escape

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

NAVY = '#0f1b3d'
BLUE = '#1a56b8'
PILL = '#dbeafe'
GREY = '#5b6475'

SUPPORT_EMAIL = 'reporting@comete.ai'
SIGNATURE_ADDRESS = '112-114 Boulevard Haussmann — 75008 PARIS'
SIGNATURE_SITE = 'www.comete.ai'


def _validity_days():
    # Django's reset tokens expire after PASSWORD_RESET_TIMEOUT seconds (default 30 days).
    seconds = getattr(settings, 'PASSWORD_RESET_TIMEOUT', 60 * 60 * 24 * 30)
    return max(1, round(seconds / 86400))


def build_invitation_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    return f'{frontend_url}/set-password/{uid}/{token}'


def _text_body(user, link, days):
    return (
        f"Bonjour {user.username},\n\n"
        f"Votre compte sur la plateforme QST vient d'être créé.\n"
        f"Pour l'activer et définir votre mot de passe, cliquez sur le lien ci-dessous :\n\n"
        f"{link}\n\n"
        f"Ce lien est valable {days} jours. Si vous n'êtes pas à l'origine de cette demande, "
        f"vous pouvez ignorer cet e-mail.\n\n"
        f"Pour toute assistance, contactez : {SUPPORT_EMAIL}\n\n"
        f"Merci pour votre attention,\n"
        f"Cordialement,\n\n"
        f"Équipe Reporting COMETE\n"
        f"{SIGNATURE_ADDRESS}\n"
        f"{SIGNATURE_SITE}\n"
    )


def _html_body(user, link, days):
    name = escape(user.username)
    logo_url = getattr(settings, 'EMAIL_LOGO_URL', None)  # public https URL of the Comete.ai logo
    if logo_url:
        logo = f'<img src="{escape(logo_url)}" alt="Comete.ai" height="42" style="display:block;border:0;">'
    else:
        logo = (f'<span style="font-size:28px;font-weight:800;color:{NAVY};letter-spacing:-0.5px;">Comete</span>'
                f'<span style="font-size:20px;font-weight:700;color:{BLUE};">.ai</span>')

    return f"""\
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f3f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
             style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:{NAVY};padding:24px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:600;">Plateforme QST</span>
        </td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:{NAVY};">Bienvenue, {name} 👋</h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#2b3345;">
            Votre compte sur la plateforme <strong>QST</strong> vient d'être créé.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#2b3345;">
            Pour l'activer, il vous suffit de définir votre mot de passe :
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr>
            <td style="background:{BLUE};border-radius:8px;">
              <a href="{escape(link)}"
                 style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Activer mon compte
              </a>
            </td>
          </tr></table>
          <p style="margin:0 0 6px;font-size:13px;color:{GREY};">
            Ce lien est valable {days} jours. Si le bouton ne fonctionne pas, copiez-collez cette adresse dans votre navigateur :
          </p>
          <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
            <a href="{escape(link)}" style="color:{BLUE};">{escape(link)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:{GREY};">
            Vous n'êtes pas à l'origine de cette demande ? Vous pouvez simplement ignorer cet e-mail.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e9f0;margin:16px 0;"></td></tr>
        <tr><td style="padding:8px 32px 32px;font-size:14px;line-height:1.6;color:{GREY};">
          <p style="margin:0 0 16px;">
            Pour toute assistance, contactez :
            <a href="mailto:{SUPPORT_EMAIL}"
               style="background:{PILL};color:{NAVY};padding:4px 10px;border-radius:6px;text-decoration:none;">{SUPPORT_EMAIL}</a>
          </p>
          <p style="margin:0 0 16px;font-weight:600;color:#3a4256;">
            Merci pour votre attention,<br>Cordialement,
          </p>
          <p style="margin:0 0 14px;">
            <strong style="color:{NAVY};">Équipe Reporting COMETE</strong><br>
            <span style="color:{BLUE};">{SIGNATURE_ADDRESS}</span><br>
            <a href="https://{SIGNATURE_SITE}" style="color:{BLUE};text-decoration:none;">{SIGNATURE_SITE}</a>
          </p>
          {logo}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_invitation_email(user):
    link = build_invitation_link(user)
    days = _validity_days()
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@comete.ai')

    msg = EmailMultiAlternatives(
        subject='Bienvenue sur la plateforme QST — activez votre compte',
        body=_text_body(user, link, days),
        from_email=from_email,
        to=[user.email],
    )
    msg.attach_alternative(_html_body(user, link, days), 'text/html')
    msg.send(fail_silently=False)


# ---------------------------------------------------------------- in your viewset
# from .invitation_email import send_invitation_email
#
# class UtilisateurViewSet(viewsets.ModelViewSet):
#     ...
#     def perform_create(self, serializer):
#         user = serializer.save()
#         send_invitation_email(user)
