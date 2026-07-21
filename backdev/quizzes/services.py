from django.db import transaction
from django.core.exceptions import ValidationError

from django.utils.timezone import now
from datetime import timedelta

from .models import Question, Corrigee, Valiny, Reponse , UtilisateurQuiz , Quiz , QuestionTypeQuestion, QuestionBareme,TypeQuestion, Bareme , QuizQuestion
from django.contrib.auth import get_user_model

User = get_user_model()

"""@transaction.atomic
def submit_qcm_answer(user: User, question_id: int, submitted_reponse_ids: list[int]) -> Valiny:

    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        raise ValidationError("Invalid Question ID.")

    # 1. Get the CORRECT answer IDs from the Corrigee table
    # This returns a simple list of integers, e.g., [2, 5]
    correct_reponse_ids = list(
        Corrigee.objects.filter(question=question).values_list('reponse_id', flat=True)
    )

    # 2. Compare the sets to see if the user got it perfectly right
    # Using Python sets ignores the order in which they were submitted
    is_correct = set(submitted_reponse_ids) == set(correct_reponse_ids)

    # 3. Calculate points
    points_awarded = 0.0
    if is_correct:
        question_bareme = question.questionbareme_set.first()
        if question_bareme:
            points_awarded = question_bareme.bareme.pts

    # 4. Create the Valiny record FIRST (Required before adding M2M data)
    valiny = Valiny.objects.create(
        utilisateur=user,
        question=question,
        vrai_ou_faux=is_correct,
        pts=points_awarded
    )

    # 5. Attach the chosen responses to the M2M field
    if submitted_reponse_ids:
        # Fetch the actual Reponse objects based on the submitted IDs
        chosen_reponses = Reponse.objects.filter(id__in=submitted_reponse_ids)
        valiny.reponses_choisies.set(chosen_reponses)

    return valiny"""

def _lock_and_validate_attempt(user, quiz_id: int):
    """
    Locks the UtilisateurQuiz row and validates timing.
    Runs in its OWN transaction so that if we mark the attempt as
    expired, that write survives even if we raise afterwards.
    """
    with transaction.atomic():
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            raise ValidationError("L'ID du Quiz est invalide.")

        try:
            # select_for_update() serializes concurrent submissions
            # for this exact (user, quiz) row — no double-grading.
            quiz_attempt = (
                UtilisateurQuiz.objects
                .select_for_update()
                .get(quiz_id=quiz_id, utilisateur=user)
            )
        except UtilisateurQuiz.DoesNotExist:
            raise ValidationError(
                "Vous n'êtes pas autorisé à passer ce quiz. Il ne vous a pas été assigné."
            )

        if quiz_attempt.termine:
            raise ValidationError("Vous avez déjà soumis ce quiz.")

        if not quiz_attempt.heure_debut:
            raise ValidationError("Vous n'avez pas démarré ce quiz correctement.")

        current_time = now()

        # Defensive: reject impossible/clock-skewed start times.
        if quiz_attempt.heure_debut > current_time:
            raise ValidationError("Horodatage de démarrage invalide.")

        max_allowed_time = quiz.duree + timedelta(seconds=30)
        time_elapsed = current_time - quiz_attempt.heure_debut

        if time_elapsed > max_allowed_time:
            # This save COMMITS here, because we're not raising
            # inside this atomic block — we return normally.
            quiz_attempt.termine = True
            quiz_attempt.save(update_fields=['termine'])
            return quiz, quiz_attempt, False  # False = expired

        return quiz, quiz_attempt, True  # True = still valid


def submit_entire_quiz(user, quiz_id: int, quiz_payload: dict):
    """
    Évalue un quiz complet en vérifiant les assignations, le chronomètre,
    et en corrigeant les réponses.
    """
    quiz, quiz_attempt, is_valid = _lock_and_validate_attempt(user, quiz_id)

    if not is_valid:
        # Puisque nous ne sommes plus dans le @transaction.atomic global, 
        # cette erreur n'annulera pas la sauvegarde effectuée dans _lock_and_validate_attempt !
        raise ValidationError("Le temps imparti est écoulé. Votre soumission a été rejetée.")

    # On sécurise uniquement le processus de correction et de calcul des points
    with transaction.atomic():
        quiz_attempt = (
            UtilisateurQuiz.objects
            .select_for_update()
            .get(pk=quiz_attempt.pk)
        )
        
        if quiz_attempt.termine:
            raise ValidationError("Vous avez déjà soumis ce quiz.")

        total_score = 0.0

        for str_question_id, submitted_reponse_ids in quiz_payload.items():
            try:
                question_id = int(str_question_id)
                submitted_set = {int(r) for r in submitted_reponse_ids}
            except (TypeError, ValueError):
                continue  

            try:
                quiz_question = QuizQuestion.objects.select_related('bareme').get(
                    quiz_id=quiz_id,
                    question_id=question_id
                )
                max_pts = quiz_question.bareme.pts
            except QuizQuestion.DoesNotExist:
                continue

            correct_rep_ids = set(
                Corrigee.objects.filter(question_id=question_id, est_correct=True)
                .values_list('reponse_id', flat=True)
            )

            is_correct = (submitted_set == correct_rep_ids) and len(correct_rep_ids) > 0
            points_earned = max_pts if is_correct else 0.0
            total_score += points_earned

            valiny = Valiny.objects.create(
                utilisateur=user,
                question_id=question_id,
                pts=points_earned,
                vrai_ou_faux=is_correct
            )
            if submitted_set:
                valiny.reponses_choisies.set(submitted_set)

        quiz_attempt.score_obtenu = total_score
        quiz_attempt.termine = True
        quiz_attempt.save(update_fields=['score_obtenu', 'termine'])

    return quiz_attempt


def assign_questions_to_quiz(quiz, questions_choisies):
    """
    Assigne des questions existantes à un quiz. 
    Permet d'appliquer dynamiquement de nouveaux barèmes ou types à une question existante,
    tout en vérifiant l'intégrité métier des réponses (Corrigee).
    """

# 🚨 BARRIÈRE DE SÉCURITÉ : Vérifier si le quiz a déjà commencé
    quiz_deja_commence = UtilisateurQuiz.objects.filter(
        quiz=quiz, 
        heure_debut__isnull=False  # Au moins un étudiant a cliqué sur "Démarrer"
    ).exists()

    if quiz_deja_commence:
        raise ValidationError(
            "Impossible de modifier ce quiz. Au moins un apprenant a déjà commencé "
            "ou terminé son évaluation. Pour garantir l'équité des notes, la structure "
            "du quiz est verrouillée."
        )

    links_to_create = []

    for item in questions_choisies:
        q_id = item['question_id']
        t_id = item['type_id']
        bareme_pts = item['bareme_pts']  # 🆕 On reçoit les points, pas l'ID !

        # 1. Vérifier que la question existe bien dans la banque
        if not Question.objects.filter(id=q_id).exists():
            raise ValidationError(f"La question avec l'ID {q_id} n'existe pas.")

        # 2. Gestion Dynamique du Barème
        # On récupère ou on crée le Barème global, puis on le lie à la question si ce n'est pas fait
        bareme_obj, _ = Bareme.objects.get_or_create(pts=float(bareme_pts))
        QuestionBareme.objects.get_or_create(question_id=q_id, bareme=bareme_obj)

        # 3. Gestion Dynamique du Type
        try:
            type_obj = TypeQuestion.objects.get(id=t_id)
        except TypeQuestion.DoesNotExist:
            raise ValidationError(f"Le type de question spécifié ({t_id}) n'existe pas.")
        
        QuestionTypeQuestion.objects.get_or_create(question_id=q_id, type_question=type_obj)

        # 4. 🚨 VÉRIFICATION DE SÉCURITÉ MÉTIER 🚨
        # Si le formateur change le type d'une question existante, on vérifie que le Corrigé reste valide
        system_code = type_obj.code.upper() if type_obj.code else "UNKNOWN"
        correct_count = Corrigee.objects.filter(question_id=q_id, est_correct=True).count()

        if system_code == 'QCU' and correct_count != 1:
            raise ValidationError(
                f"Impossible d'assigner la question {q_id} en tant que QCU. "
                f"Elle possède actuellement {correct_count} réponses correctes dans la banque, alors qu'un QCU en exige exactement UNE."
            )
        elif system_code == 'QCM' and correct_count < 1:
            raise ValidationError(
                f"Impossible d'assigner la question {q_id} en tant que QCM. "
                f"Elle ne possède aucune réponse correcte."
            )

        # 5. Préparer la liaison avec le Quiz (si elle n'existe pas déjà pour CE quiz précis)
        if not QuizQuestion.objects.filter(quiz=quiz, question_id=q_id, type_question=type_obj, bareme=bareme_obj).exists():
            links_to_create.append(
                QuizQuestion(quiz=quiz, question_id=q_id, type_question=type_obj, bareme=bareme_obj)
            )

    # 6. Exécution en base de données
    if links_to_create:
        QuizQuestion.objects.bulk_create(links_to_create)

    return len(links_to_create)

@transaction.atomic
def create_question_with_answers(enonce, type_id, bareme_id, options):
    """
    Creates a question, links its configurations, and generates its answers and corrigé.
    Wrapped in @transaction.atomic to guarantee database integrity.
    """
    
    # 1. Fetch relations to ensure they exist
    try:
        type_obj = TypeQuestion.objects.get(id=type_id)
        bareme_obj = Bareme.objects.get(id=bareme_id)
    except (TypeQuestion.DoesNotExist, Bareme.DoesNotExist):
        raise ValidationError("Le Type ou le Barème spécifié n'existe pas.")

    # 2. Strict Business Logic Check (QCU vs QCM vs Ouverte)
    system_code = type_obj.code.upper() if type_obj.code else "UNKNOWN"
    correct_count = sum(1 for opt in options if opt.get('est_correct', False))

    if system_code == 'QCU' and correct_count != 1:
        raise ValidationError("Un QCU (Choix Unique) doit avoir exactement UNE réponse correcte.")
    elif system_code == 'QCM' and correct_count < 1:
        raise ValidationError("Un QCM (Choix Multiple) doit avoir au moins UNE réponse correcte.")
    elif system_code == 'OUV' and len(options) > 0:
        raise ValidationError("Une question ouverte ne doit pas avoir d'options prédéfinies.")

    # 3. Create the Question Object
    question = Question.objects.create(enonce_question=enonce)

    # 4. Link the Type and Bareme
    QuestionTypeQuestion.objects.create(question=question, type_question=type_obj)
    QuestionBareme.objects.create(question=question, bareme=bareme_obj)

    # 5. Create the Answers and link them via the upgraded Corrigee table
    for opt in options:
        reponse_text = opt.get('reponse', '').strip()
        if not reponse_text:
            continue
            
        # get_or_create reuses identical text (e.g., "Vrai", "Faux") to save DB space
        reponse_obj, created = Reponse.objects.get_or_create(reponse=reponse_text)
        
        # Link EVERY option (right and wrong) to the question
        Corrigee.objects.create(
            question=question, 
            reponse=reponse_obj,
            est_correct=opt.get('est_correct', False), # We save the boolean here!
            explication=opt.get('explication', '')
        )

    return question

def search_questions_in_bank_service(search_term: str = None, type_code: str = None):
    # Requête de base optimisée
    queryset = Question.objects.prefetch_related('corrigee_set__reponse').all().order_by('-id')

    # Filtre par texte
    if search_term:
        queryset = queryset.filter(enonce_question__icontains=search_term)

    # Filtre par type (QCM, QCU...)
    if type_code:
        queryset = queryset.filter(questiontypequestion__type_question__code__iexact=type_code)

    return queryset.distinct()