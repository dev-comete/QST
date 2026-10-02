from django.db.models import Sum, Avg
from django.shortcuts import get_object_or_404
from formations.models import Vague
from quizzes.models import QuizQuestion, UtilisateurQuiz

def get_evolution_interactive_service(vague_id: int, student_ids: list = None):
    """
    Génère les données chronologiques pour un graphique d'évolution.
    Permet de superposer la moyenne de la classe avec les scores d'étudiants spécifiques.
    """
    vague = get_object_or_404(Vague, id=vague_id)
    
    # 1. On récupère le programme officiel, ordonné chronologiquement
    quizzes = vague.quizzes.all().order_by('id') # ou 'date_ouverture' si vous l'utilisez
    
    # 2. Base de données des copies rendues
    copies_rendues = UtilisateurQuiz.objects.filter(
        vague=vague, 
        termine=True
    ).select_related('utilisateur')

    evolution_chart_data = []

    # 3. Construction des points de la courbe
    for quiz in quizzes:
        # A. Calcul des points maximums du quiz pour convertir en pourcentage
        max_pts = QuizQuestion.objects.filter(quiz=quiz).aggregate(
            total=Sum('bareme__pts')
        )['total'] or 1.0  # 1.0 pour éviter la division par zéro

        copies_du_quiz = copies_rendues.filter(quiz=quiz)
        
        # B. Calcul de la moyenne de la classe (La courbe de référence)
        avg_score = copies_du_quiz.aggregate(Avg('score_obtenu'))['score_obtenu__avg'] or 0.0
        moyenne_pct = round((avg_score / float(max_pts)) * 100, 1)

        # C. Le point de donnée de base (Axe X)
        data_point = {
            "quiz_id": quiz.id,
            "quiz_titre": quiz.titre,
            "moyenne_classe": moyenne_pct
        }

        # D. Ajout dynamique des courbes des étudiants sélectionnés
        if student_ids:
            for s_id in student_ids:
                copie_etudiant = copies_du_quiz.filter(utilisateur_id=s_id).first()
                
                # La clé dynamique permet à Recharts de tracer une ligne séparée par étudiant
                cle_etudiant = f"etudiant_{s_id}"
                
                if copie_etudiant:
                    score_pct = round((float(copie_etudiant.score_obtenu) / float(max_pts)) * 100, 1)
                    data_point[cle_etudiant] = score_pct
                else:
                    # L'étudiant a raté ce quiz (la ligne sera brisée ou à 0 sur le graphique)
                    data_point[cle_etudiant] = None 

        evolution_chart_data.append(data_point)

    # 4. On renvoie aussi un dictionnaire des noms pour la légende du graphique React
    legendes = {"moyenne_classe": "Moyenne de la Vague"}
    if student_ids:
        etudiants = copies_rendues.filter(utilisateur_id__in=student_ids).values('utilisateur_id', 'utilisateur__username').distinct()
        for e in etudiants:
            legendes[f"etudiant_{e['utilisateur_id']}"] = f"{e['utilisateur__username']}"

    return {
        "legendes": legendes,
        "chart_data": evolution_chart_data
    }