from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Question, Corrigee, Valiny, Quiz
from django.contrib.auth import get_user_model

User = get_user_model()

@transaction.atomic
def submit_student_answer(user: User, quiz_id: int, question_id: int, submitted_text: str) -> Valiny:
    """
    Evaluates a student's answer, calculates points, and saves the Valiny.
    """
    # 1. Fetch related objects (with basic error handling)
    try:
        question = Question.objects.get(id=question_id)
        # Assuming a question has one primary correct answer linked via Corrigee
        corrigee = Corrigee.objects.get(question=question)
        quiz = Quiz.objects.get(id=quiz_id)
    except (Question.DoesNotExist, Corrigee.DoesNotExist, Quiz.DoesNotExist):
        raise ValidationError("Invalid Question, Quiz, or Missing Answer Key.")

    # 2. Business Logic: Evaluate the answer
    # Note: In a real app, this matching might be more complex (e.g., lowercase, regex)
    correct_text = corrigee.reponse.reponse
    is_correct = (submitted_text.strip().lower() == correct_text.strip().lower())

    # 3. Calculate points based on the QuestionBareme
    # For simplicity, assuming the question has a linked bareme.
    points_awarded = 0.0
    if is_correct:
        # Fetch the points from the QuestionBareme table
        question_bareme = question.questionbareme_set.first()
        if question_bareme:
            points_awarded = question_bareme.bareme.pts

    # 4. Save to Database
    valiny = Valiny.objects.create(
        user_valiny=submitted_text,
        corrigee=corrigee,
        vrai_ou_faux=is_correct,
        pts=points_awarded,
        utilisateur=user  # Assuming you added this ForeignKey as discussed!
    )

    return valiny