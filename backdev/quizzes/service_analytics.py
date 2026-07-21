from django.db.models import Sum, Avg, Count
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

from formations.models import Vague, UtilisateurVague
from quizzes.models import Quiz, UtilisateurQuiz, QuizQuestion, Valiny


def get_vague_analytics_service(vague_id: int, requesting_user) -> dict:
    """
    Business logic to compute global and per-quiz analytics for a given Vague.
    """
    # 1. Fetch Vague & Permission Check
    vague = get_object_or_404(Vague.objects.select_related('formation'), id=vague_id)

    if vague.formation.createur != requesting_user and not requesting_user.is_superuser:
        raise PermissionDenied("Vous n'êtes pas autorisé à voir les statistiques de cette vague.")

    # 2. Fetch enrolled students
    etudiants_ids = UtilisateurVague.objects.filter(vague=vague).values_list('utilisateur_id', flat=True)
    total_etudiants = etudiants_ids.count()

    if total_etudiants == 0:
        return {
            "vague": {
                "id": vague.id,
                "formation": vague.formation.nom_formation,
                "total_inscrits": 0
            },
            "message": "Aucun étudiant n'est inscrit dans cette vague pour le moment."
        }

    quizzes = Quiz.objects.filter(formation=vague.formation)

    # --- A. GLOBAL VAGUE ANALYTICS ---
    total_max_points = QuizQuestion.objects.filter(quiz__in=quizzes).aggregate(
        total=Sum('bareme__pts')
    )['total'] or 0.0

    etudiants_scores = UtilisateurQuiz.objects.filter(
        quiz__in=quizzes,
        utilisateur_id__in=etudiants_ids,
        termine=True
    ).values(
        'utilisateur__username', 'utilisateur__first_name', 'utilisateur__last_name'
    ).annotate(
        score_cumule=Sum('score_obtenu')
    ).order_by('-score_cumule')

    succes_global_count = sum(1 for e in etudiants_scores if e['score_cumule'] >= (total_max_points / 2))
    global_success_rate = (succes_global_count / total_etudiants * 100) if total_etudiants else 0.0
    global_avg = etudiants_scores.aggregate(Avg('score_cumule'))['score_cumule__avg'] or 0.0

    # --- B. PER-QUIZ ANALYTICS ---
    quizzes_data = []

    for quiz in quizzes:
        quiz_max_pts = QuizQuestion.objects.filter(quiz=quiz).aggregate(
            total=Sum('bareme__pts')
        )['total'] or 0.0

        tentatives = UtilisateurQuiz.objects.filter(
            quiz=quiz, 
            utilisateur_id__in=etudiants_ids, 
            termine=True
        ).select_related('utilisateur')

        participants_count = tentatives.count()
        participation_rate = (participants_count / total_etudiants * 100) if total_etudiants else 0.0
        quiz_avg = tentatives.aggregate(Avg('score_obtenu'))['score_obtenu__avg'] or 0.0
        
        succes_count = tentatives.filter(score_obtenu__gte=(quiz_max_pts / 2)).count()
        success_rate = (succes_count / participants_count * 100) if participants_count else 0.0

        tentatives_triees = tentatives.order_by('-score_obtenu')
        
        # Identify the most failed question
        questions_du_quiz = QuizQuestion.objects.filter(quiz=quiz).values_list('question_id', flat=True)
        pire_question = Valiny.objects.filter(
            question_id__in=questions_du_quiz,
            utilisateur_id__in=etudiants_ids,
            vrai_ou_faux=False
        ).values('question__enonce_question').annotate(
            echecs=Count('id')
        ).order_by('-echecs').first()

        quizzes_data.append({
            "quiz_id": quiz.id,
            "status": quiz.status,
            "points_maximum": quiz_max_pts,
            "taux_participation_pct": round(participation_rate, 1),
            "moyenne_classe": round(quiz_avg, 2),
            "taux_reussite_pct": round(success_rate, 1),
            "top_3": [
                {"username": t.utilisateur.username, "score": t.score_obtenu} 
                for t in tentatives_triees[:3]
            ],
            "bottom_3": [
                {"username": t.utilisateur.username, "score": t.score_obtenu} 
                for t in tentatives.order_by('score_obtenu')[:3]
            ],
            "alerte_question_difficile": pire_question['question__enonce_question'] if pire_question else None,
            "nombre_echecs_question": pire_question['echecs'] if pire_question else 0
        })

    return {
        "vague": {
            "id": vague.id,
            "formation": vague.formation.nom_formation,
            "total_inscrits": total_etudiants
        },
        "statistiques_globales": {
            "points_totaux_possibles": total_max_points,
            "moyenne_globale_classe": round(global_avg, 2),
            "taux_reussite_global_pct": round(global_success_rate, 1),
            "majors_de_promo_top3": list(etudiants_scores[:3]),
            "etudiants_en_difficulte_bottom3": list(etudiants_scores.order_by('score_cumule')[:3])
        },
        "statistiques_par_quiz": quizzes_data
    }

def get_apprenant_bulletin_service(vague_id: int, apprenant) -> dict:
    """
    Génère le bulletin de notes détaillé d'un apprenant pour une vague spécifique.
    """
    # 1. Vérification : L'étudiant est-il bien inscrit à cette vague ?
    vague = get_object_or_404(Vague.objects.select_related('formation'), id=vague_id)
    
    est_inscrit = UtilisateurVague.objects.filter(vague=vague, utilisateur=apprenant).exists()
    if not est_inscrit:
        raise PermissionDenied("Vous n'êtes pas inscrit à cette vague.")

    # 2. Récupérer tous les quiz liés à la formation de cette vague
    # (Vous pouvez ajouter un filtre `status='publie'` si vous gérez des brouillons)
    quizzes = Quiz.objects.filter(formation=vague.formation)
    total_quizzes = quizzes.count()

    # 3. Optimisation : Calculer les points maximums de chaque quiz en UNE seule requête
    quiz_max_pts = dict(
        QuizQuestion.objects.filter(quiz__in=quizzes)
        .values('quiz_id')
        .annotate(total=Sum('bareme__pts'))
        .values_list('quiz_id', 'total')
    )

    # 4. Optimisation : Récupérer toutes les tentatives de cet étudiant en UNE requête
    tentatives = {
        t.quiz_id: t 
        for t in UtilisateurQuiz.objects.filter(utilisateur=apprenant, quiz__in=quizzes)
    }

    bulletin_details = []
    total_obtenu_vague = 0.0
    total_possible_vague = 0.0
    quizzes_termines = 0

    # 5. Construction du bulletin ligne par ligne
    for quiz in quizzes:
        max_pts = float(quiz_max_pts.get(quiz.id, 0.0))
        tentative = tentatives.get(quiz.id)
        
        total_possible_vague += max_pts
        
        score = 0.0
        statut = "Non commencé"
        
        if tentative:
            if tentative.termine:
                statut = "Terminé"
                score = float(tentative.score_obtenu)
                total_obtenu_vague += score
                quizzes_termines += 1
            else:
                statut = "En cours"

        pourcentage = round((score / max_pts * 100), 1) if max_pts > 0 else 0.0

        bulletin_details.append({
            "quiz_id": quiz.id,
            "statut": statut,
            "score_obtenu": round(score, 2),
            "score_maximum": max_pts,
            "pourcentage": pourcentage
        })

    # 6. Calcul de la moyenne globale
    moyenne_generale_pct = round((total_obtenu_vague / total_possible_vague * 100), 1) if total_possible_vague > 0 else 0.0

    return {
        "apprenant": {
            "id": apprenant.id,
            "nom": apprenant.last_name,
            "prenom": apprenant.first_name,
            "username": apprenant.username
        },
        "vague": {
            "id": vague.id,
            "formation": vague.formation.nom_formation
        },
        "resume_global": {
            "total_score_obtenu": round(total_obtenu_vague, 2),
            "total_score_possible": round(total_possible_vague, 2),
            "moyenne_generale_pct": moyenne_generale_pct,
            "progression": f"{quizzes_termines}/{total_quizzes} quiz terminés"
        },
        "details_quizzes": bulletin_details
    }