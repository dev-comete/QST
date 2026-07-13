from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Question, Corrigee, Valiny, Reponse , UtilisateurQuiz , Quiz
from django.contrib.auth import get_user_model

User = get_user_model()

@transaction.atomic
def submit_qcm_answer(user: User, question_id: int, submitted_reponse_ids: list[int]) -> Valiny:
    """
    Evaluates a QCM/QCU answer by comparing sets of Response IDs.
    """
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

    return valiny

@transaction.atomic
def submit_entire_quiz(user: User, quiz_id: int, quiz_payload: dict) -> UtilisateurQuiz:
    """
    Evaluates an entire quiz.
    
    Expected quiz_payload format (Dict mapping Question IDs to a List of Response IDs):
    {
        "1": [3, 4],  # Question ID 1 -> User chose Responses 3 and 4
        "2": [8],     # Question ID 2 -> User chose Response 8
        "3": []       # Question ID 3 -> User left it blank
    }
    """
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        raise ValidationError("Invalid Quiz ID.")

    total_score = 0.0

    # 1. Loop through every question the user answered
    for str_question_id, submitted_reponse_ids in quiz_payload.items():
        question_id = int(str_question_id)
        
        # 2. Reuse our bulletproof single-question logic!
        valiny = submit_qcm_answer(
            user=user,
            question_id=question_id,
            submitted_reponse_ids=submitted_reponse_ids
        )
        
        # 3. Add to the running total
        total_score += valiny.pts

    # 4. Save the final score in the UtilisateurQuiz table
    # update_or_create ensures that if they retake the quiz, we update their score
    quiz_attempt, created = UtilisateurQuiz.objects.update_or_create(
        utilisateur=user,
        quiz=quiz,
        defaults={
            'score_obtenu': total_score,
            'termine': True
        }
    )

    return quiz_attempt