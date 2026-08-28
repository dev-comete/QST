# quizzes/dashboard_services.py
from django.utils.timezone import now
from django.db.models import Sum

from formations.models import Formation, Vague
from quizzes.models import Quiz, Question, UtilisateurQuiz, QuizQuestion

def get_dashboard_metrics_service(user):
    """
    Calcule toutes les métriques du tableau de bord pour un utilisateur donné,
    en respectant le cloisonnement (multi-tenancy) de son organisation.
    """
    is_admin = user.is_staff or user.is_superuser
    orga = user.orga_principale

    # --- 1. Filtres Multi-tenancy ---
    if is_admin:
        formations = Formation.objects.all()
        quizzes = Quiz.objects.all()
        questions = Question.objects.all()
        vagues = Vague.objects.all()
    else:
        formations = Formation.objects.filter(organisation=orga)
        quizzes = Quiz.objects.filter(formation__organisation=orga)
        questions = Question.objects.filter(organisation=orga)
        vagues = Vague.objects.filter(formation__organisation=orga)

    # --- 2. Calcul des KPIs ---
    total_formations = formations.count()
    total_quiz_actifs = quizzes.filter(status='published').count()
    total_questions = questions.filter(is_active=True).count()

    tentatives = UtilisateurQuiz.objects.filter(quiz__in=quizzes, termine=True)
    taux_reussite = "0%"
    
    if tentatives.exists():
        points_obtenus = tentatives.aggregate(Sum('score_obtenu'))['score_obtenu__sum'] or 0
        quiz_ids = tentatives.values_list('quiz_id', flat=True).distinct()
        points_max_total = QuizQuestion.objects.filter(quiz_id__in=quiz_ids).aggregate(Sum('bareme__pts'))['bareme__pts__sum'] or 1
        
        moyenne_pct = (points_obtenus / (points_max_total * tentatives.count())) * 100
        taux_reussite = f"{round(moyenne_pct)}%"

    stats = [
        {"label": "Formations", "value": str(total_formations), "change": "Actives", "tone": "harbor"},
        {"label": "Quiz publiés", "value": str(total_quiz_actifs), "change": "En ligne", "tone": "success"},
        {"label": "Questions", "value": str(total_questions), "change": "Dans la banque", "tone": "info"},
        {"label": "Taux de réussite", "value": taux_reussite, "change": "Global", "tone": "warning"},
    ]

    # --- 3. Quiz Récents ---
    recent_quizzes = []
    for q in quizzes.filter(status='published').order_by('-date_creation_quiz')[:3]:
        total_assignes = UtilisateurQuiz.objects.filter(quiz=q).count()
        total_termines = UtilisateurQuiz.objects.filter(quiz=q, termine=True).count()
        
        completion_pct = round((total_termines / total_assignes * 100)) if total_assignes > 0 else 0
        
        status_text = "À lancer"
        if completion_pct == 100 and total_assignes > 0: status_text = "Validé"
        elif completion_pct > 0: status_text = "En cours"

        recent_quizzes.append({
            "name": q.titre,
            "completion": f"{completion_pct}%",
            "status": status_text
        })

    # --- 4. Sessions à venir ---
    upcoming_sessions = []
    for v in vagues.filter(debut__gte=now()).order_by('debut')[:3]:
        upcoming_sessions.append({
            "name": v.formation.nom_formation,
            "date": v.debut.strftime("%d %b %Y") 
        })

    # On retourne un dictionnaire Python standard (snake_case)
    return {
        "stats": stats,
        "recent_quizzes": recent_quizzes,
        "upcoming_sessions": upcoming_sessions
    }