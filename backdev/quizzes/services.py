from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Question, Corrigee, Valiny, Reponse , UtilisateurQuiz , Quiz , QuestionTypeQuestion, QuestionBareme,TypeQuestion, Bareme , QuizQuestion
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
            est_correct=opt.get('est_correct', False) # We save the boolean here!
        )

    return question