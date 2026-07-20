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


@transaction.atomic
def submit_entire_quiz(user, quiz_id: int, quiz_payload: dict):
    """
    Évalue un quiz complet en vérifiant les assignations, le chronomètre, et en corrigeant les réponses.
    """
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        quiz_attempt = UtilisateurQuiz.objects.get(quiz_id=quiz_id, utilisateur=user)
    except Quiz.DoesNotExist:
        raise ValidationError("L'ID du Quiz est invalide.")
    except UtilisateurQuiz.DoesNotExist:
        raise ValidationError("Vous n'êtes pas autorisé à passer ce quiz. Il ne vous a pas été assigné.")

    # 1. VÉRIFICATION DES TENTATIVES
    if quiz_attempt.termine:
        raise ValidationError("Vous avez déjà soumis ce quiz. Les tentatives multiples ne sont pas autorisées.")

    # 2. VÉRIFICATION DU CHRONOMÈTRE
    if not quiz_attempt.heure_debut:
        raise ValidationError("Vous n'avez pas démarré ce quiz correctement.")

    time_elapsed = now() - quiz_attempt.heure_debut
    max_allowed_time = quiz.duree + timedelta(seconds=30) # 30 sec de tolérance réseau

    if time_elapsed > max_allowed_time:
        quiz_attempt.termine = True
        quiz_attempt.save(update_fields=['termine'])
        raise ValidationError("Le temps imparti est écoulé. Votre soumission a été rejetée.")

    total_score = 0.0

    # 3. CORRECTION DES QUESTIONS
    for str_question_id, submitted_reponse_ids in quiz_payload.items():
        question_id = int(str_question_id)
        
        # A. Trouver le barème pour cette question dans CE quiz
        try:
            quiz_question = QuizQuestion.objects.select_related('bareme').get(
                quiz_id=quiz_id, 
                question_id=question_id
            )
            max_pts = quiz_question.bareme.pts
        except QuizQuestion.DoesNotExist:
            continue # Question invalide pour ce quiz, on l'ignore

        # B. Récupérer les ID des vraies bonnes réponses
        correct_corriges = Corrigee.objects.filter(question_id=question_id, est_correct=True)
        correct_rep_ids = set(correct_corriges.values_list('reponse_id', flat=True))
        submitted_set = set(submitted_reponse_ids)

        # C. Calcul des points (L'étudiant doit avoir tout bon, sans aucune erreur additionnelle)
        is_correct = (submitted_set == correct_rep_ids) and len(correct_rep_ids) > 0
        points_earned = max_pts if is_correct else 0.0
        
        total_score += points_earned

        # D. Enregistrement de la trace de l'apprenant (Valiny)
        valiny = Valiny.objects.create(
            utilisateur=user,
            question_id=question_id,
            pts=points_earned,
            vrai_ou_faux=is_correct
        )
        
        # Associer les réponses sélectionnées par l'étudiant
        if submitted_reponse_ids:
            valiny.reponses_choisies.set(submitted_reponse_ids)

    # 4. FINALISATION
    quiz_attempt.score_obtenu = total_score
    quiz_attempt.termine = True
    quiz_attempt.save(update_fields=['score_obtenu', 'termine'])

    return quiz_attempt


def assign_questions_to_quiz(quiz, questions_choisies):
    """
    Validates and assigns a list of existing question configurations to a quiz.
    Raises a DRF ValidationError if business rules are violated.
    """
    links_to_create = []

    for item in questions_choisies:
        q_id = item['question_id']
        t_id = item['type_id']
        b_id = item['bareme_id']
        
        # 1. Verify this combo actually exists in the Question Bank
        valid_type = QuestionTypeQuestion.objects.filter(question_id=q_id, type_question_id=t_id).exists()
        valid_bareme = QuestionBareme.objects.filter(question_id=q_id, bareme_id=b_id).exists()
        
        if not valid_type or not valid_bareme:
            raise ValidationError(f"La question {q_id} ne possède pas le type {t_id} ou le barème {b_id}.")

        # 2. UPDATED: Verify that the question has at least one CORRECT answer
        type_obj = TypeQuestion.objects.get(id=t_id)
        is_open_question = 'ouverte' in type_obj.type_question.lower()
        
        # We now explicitly look for rows where est_correct=True
        has_correct_answer = Corrigee.objects.filter(question_id=q_id, est_correct=True).exists()
        
        if not is_open_question and not has_correct_answer:
            raise ValidationError(
                f"La question {q_id} (Type: {type_obj.type_question}) n'a aucune "
                f"réponse marquée comme correcte dans la banque. Veuillez la modifier d'abord."
            )
            
        # 3. Queue the specific combo to be saved
        if not QuizQuestion.objects.filter(quiz=quiz, question_id=q_id, type_question_id=t_id, bareme_id=b_id).exists():
            links_to_create.append(
                QuizQuestion(quiz=quiz, question_id=q_id, type_question_id=t_id, bareme_id=b_id)
            )

    # 4. Database execution
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
    type_name = type_obj.type_question.lower()
    correct_count = sum(1 for opt in options if opt.get('est_correct', False))

    if 'qcu' in type_name and correct_count != 1:
        raise ValidationError("Un QCU (Choix Unique) doit avoir exactement UNE réponse correcte.")
    elif 'qcm' in type_name and correct_count < 1:
        raise ValidationError("Un QCM (Choix Multiple) doit avoir au moins UNE réponse correcte.")
    elif 'ouverte' in type_name and len(options) > 0:
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