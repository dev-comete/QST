from .models import Notification

def notify_formateur_of_quiz_submission(user, quiz_attempt):
    print("\n--- [NOTIF DEBUG] Démarrage de notify_formateur_of_quiz_submission ---")
    
    try:
        # 1. Identifier la formation
        formation = quiz_attempt.quiz.formation
        print(f"[NOTIF DEBUG] Formation trouvée : ID {formation.id}")
        
        # 2. Identifier le formateur
        formateur = getattr(formation, 'createur', None)
        
        if not formateur:
            print(f"[NOTIF DEBUG] ÉCHEC : La formation ID {formation.id} n'a pas de formateur/créateur assigné (champ 'createur' introuvable ou vide).")
            return
            
        print(f"[NOTIF DEBUG] Formateur identifié : {formateur.username} (ID: {formateur.id})")

        # 3. Récupérer les détails
        nom_vague = quiz_attempt.vague.nom_vague if quiz_attempt.vague else "Vague inconnue"
        nom_apprenant = f"{user.first_name} {user.last_name}".strip() or user.username
        
        print(f"[NOTIF DEBUG] Données - Apprenant: {nom_apprenant} | Vague: {nom_vague} | Quiz: {quiz_attempt.quiz.titre}")

        # 4. Construire le message
        titre_notif = "Nouvelle soumission de quiz"
        message_notif = (
            f"L'apprenant {nom_apprenant} a terminé le quiz '{quiz_attempt.quiz.titre}' "
            f"dans la vague '{nom_vague}'."
        )
        
        # 5. Créer la notification
        notif = Notification.objects.create(
            destinataire=formateur,
            titre=titre_notif,
            message=message_notif,
            type_notif="quiz_submitted",
        )
        print(f"[NOTIF DEBUG] SUCCÈS : Notification (ID {notif.id}) persistée en BDD pour le formateur {formateur.username}.")
        print("--- [NOTIF DEBUG] Fin de l'opération ---\n")

    except Exception as e:
        print(f"[NOTIF DEBUG] EXCEPTION CRITIQUE lors de la création de la notification : {str(e)}")