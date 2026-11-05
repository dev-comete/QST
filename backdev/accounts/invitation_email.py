# accounts/invitation_email.py
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
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    return f'{frontend_url}/set-password/{uid}/{token}'


def _text_body(user, link, days, is_reset):
    if is_reset:
        intro = "Votre demande de réinitialisation de mot de passe a été approuvée."
        action = "définir votre nouveau mot de passe"
    else:
        intro = "Votre compte sur la plateforme QST vient d'être créé."
        action = "l'activer et définir votre mot de passe"

    return (
        f"Bonjour {user.username},\n\n"
        f"{intro}\n"
        f"Pour {action}, cliquez sur le lien ci-dessous :\n\n"
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


def _html_body(user, link, days, is_reset):
    name = escape(user.username)
    logo_url = getattr(settings, 'EMAIL_LOGO_URL', None)  # public https URL of the Comete.ai logo
    if logo_url:
        logo = f'<img src="{escape(logo_url)}" alt="Comete.ai" height="42" style="display:block;border:0;">'
    else:
        logo = (f'<span style="font-size:28px;font-weight:800;color:{NAVY};letter-spacing:-0.5px;">Comete</span>'
                f'<span style="font-size:20px;font-weight:700;color:{BLUE};">.ai</span>')

    titre = f"Bonjour, {name}" if is_reset else f"Bienvenue, {name} 👋"
    sous_titre = (
        "Votre demande de <strong>réinitialisation de mot de passe</strong> a été approuvée." 
        if is_reset else 
        "Votre compte sur la plateforme <strong>QST</strong> vient d'être créé."
    )
    texte_bouton = "Réinitialiser mon mot de passe" if is_reset else "Activer mon compte"

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
          <h1 style="margin:0 0 16px;font-size:22px;color:{NAVY};">{titre}</h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#2b3345;">
            {sous_titre}
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#2b3345;">
            Pour continuer, il vous suffit de cliquer ci-dessous :
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr>
            <td style="background:{BLUE};border-radius:8px;">
              <a href="{escape(link)}"
                 style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                {texte_bouton}
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
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez simplement ignorer cet e-mail.
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


def send_invitation_email(user, is_reset=False):
    link = build_invitation_link(user)
    days = _validity_days()
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@comete.ai')
    
    sujet = 'Réinitialisation de votre mot de passe QST' if is_reset else 'Bienvenue sur la plateforme QST — activez votre compte'

    msg = EmailMultiAlternatives(
        subject=sujet,
        body=_text_body(user, link, days, is_reset),
        from_email=from_email,
        to=[user.email],
    )
    msg.attach_alternative(_html_body(user, link, days, is_reset), 'text/html')
    msg.send(fail_silently=False)