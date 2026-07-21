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