from datetime import timedelta
from unittest.mock import patch
from django.test import TestCase
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# Importez vos modèles depuis vos autres applications
from accounts.models import TypeUtilisateur 
from formations.models import Formation     

from quizzes.models import (
    Quiz, Question, Reponse, Corrigee, UtilisateurQuiz, 
    TypeQuestion, Bareme, QuizQuestion, Valiny
)

from quizzes.services import submit_entire_quiz 

User = get_user_model()

class SubmitEntireQuizTests(TestCase):
    def setUp(self):
        # 1. Créer les rôles
        self.type_formateur = TypeUtilisateur.objects.create(type_utilisateur="formateur")
        self.type_apprenant = TypeUtilisateur.objects.create(type_utilisateur="apprenant")

        # 2. Créer les utilisateurs
        self.formateur = User.objects.create_user(
            username="prof1", 
            password="password123", 
            email="prof@test.com", 
            type_utilisateur=self.type_formateur
        )
        self.user = User.objects.create_user(
            username="student1", 
            password="password123", 
            email="student@test.com", 
            type_utilisateur=self.type_apprenant
        )
        
        # 3. Créer une Formation 
        self.formation = Formation.objects.create(
            nom_formation="Formation Test", 
            createur=self.formateur
        )

        # 4. Créer le Quiz (SANS TITRE !)
        self.quiz = Quiz.objects.create(
            formation=self.formation,
            duree=timedelta(minutes=15),
            status="Actif"
        )
        
        # 5. Créer TypeQuestion & Bareme 
        self.type_qcu = TypeQuestion.objects.create(type_question="QCU", code="QCU")
        self.type_qcm = TypeQuestion.objects.create(type_question="QCM", code="QCM")
        self.bareme_2 = Bareme.objects.create(pts=2.0)
        self.bareme_3 = Bareme.objects.create(pts=3.0)

        # 6. Créer Question 1 
        self.q1 = Question.objects.create(enonce_question="Question 1 (QCU)")
        self.q1_rep1 = Reponse.objects.create(reponse="Q1_Correct")
        self.q1_rep2 = Reponse.objects.create(reponse="Q1_Faux")
        Corrigee.objects.create(question=self.q1, reponse=self.q1_rep1, est_correct=True)
        Corrigee.objects.create(question=self.q1, reponse=self.q1_rep2, est_correct=False)
        QuizQuestion.objects.create(quiz=self.quiz, question=self.q1, type_question=self.type_qcu, bareme=self.bareme_2)

        # 7. Créer Question 2 
        self.q2 = Question.objects.create(enonce_question="Question 2 (QCM)")
        self.q2_rep1 = Reponse.objects.create(reponse="Q2_Correct_1")
        self.q2_rep2 = Reponse.objects.create(reponse="Q2_Correct_2")
        self.q2_rep3 = Reponse.objects.create(reponse="Q2_Faux")
        Corrigee.objects.create(question=self.q2, reponse=self.q2_rep1, est_correct=True)
        Corrigee.objects.create(question=self.q2, reponse=self.q2_rep2, est_correct=True)
        Corrigee.objects.create(question=self.q2, reponse=self.q2_rep3, est_correct=False)
        QuizQuestion.objects.create(quiz=self.quiz, question=self.q2, type_question=self.type_qcm, bareme=self.bareme_3)

        # 8. Assigner le Quiz
        self.start_time = now()
        self.assignment = UtilisateurQuiz.objects.create(
            utilisateur=self.user,
            quiz=self.quiz,
            heure_debut=self.start_time,
            termine=False,
            score_obtenu=0.0
        )

    def test_successful_submission_perfect_score(self):
        payload = {
            str(self.q1.id): [self.q1_rep1.id],
            str(self.q2.id): [self.q2_rep1.id, self.q2_rep2.id]
        }
        result = submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assertTrue(result.termine)
        self.assertEqual(result.score_obtenu, 5.0) 
        self.assertEqual(Valiny.objects.filter(utilisateur=self.user).count(), 2)

    def test_submission_partial_and_incorrect_score(self):
        payload = {
            str(self.q1.id): [self.q1_rep2.id], 
            str(self.q2.id): [self.q2_rep1.id] 
        }
        result = submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assertTrue(result.termine)
        self.assertEqual(result.score_obtenu, 0.0)

    def test_malformed_payload_handling(self):
        payload = {
            str(self.q1.id): [self.q1_rep1.id], 
            "invalid_id": ["not_an_int"],       
            str(self.q2.id): "just_a_string"    
        }
        result = submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assertTrue(result.termine)
        self.assertEqual(result.score_obtenu, 2.0) 

    @patch('quizzes.services.now') 
    def test_submission_time_expired(self, mock_now):
        mock_now.return_value = self.start_time + timedelta(minutes=16)
        payload = {str(self.q1.id): [self.q1_rep1.id]}
        with self.assertRaisesMessage(ValidationError, "Le temps imparti est écoulé."):
            submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assignment.refresh_from_db()
        self.assertTrue(self.assignment.termine)
        self.assertEqual(self.assignment.score_obtenu, 0.0)

    @patch('quizzes.services.now')
    def test_submission_within_grace_period(self, mock_now):
        mock_now.return_value = self.start_time + timedelta(minutes=15, seconds=20)
        payload = {str(self.q1.id): [self.q1_rep1.id]}
        result = submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assertTrue(result.termine)
        self.assertEqual(result.score_obtenu, 2.0)

    @patch('quizzes.services.now')
    def test_clock_skew_future_start_time(self, mock_now):
        mock_now.return_value = self.start_time - timedelta(minutes=5)
        payload = {}
        with self.assertRaisesMessage(ValidationError, "Horodatage de démarrage invalide."):
            submit_entire_quiz(self.user, self.quiz.id, payload)
        self.assignment.refresh_from_db()
        self.assertFalse(self.assignment.termine)

    def test_already_submitted_rejection(self):
        self.assignment.termine = True
        self.assignment.save()
        payload = {str(self.q1.id): [self.q1_rep1.id]}
        with self.assertRaisesMessage(ValidationError, "Vous avez déjà soumis ce quiz."):
            submit_entire_quiz(self.user, self.quiz.id, payload)

    def test_not_started_rejection(self):
        self.assignment.heure_debut = None
        self.assignment.save()
        payload = {str(self.q1.id): [self.q1_rep1.id]}
        with self.assertRaisesMessage(ValidationError, "Vous n'avez pas démarré ce quiz correctement."):
            submit_entire_quiz(self.user, self.quiz.id, payload)

    def test_unassigned_quiz_rejection(self):
        other_quiz = Quiz.objects.create(
            formation=self.formation, 
            duree=timedelta(minutes=10),
            status="Actif"
        )
        payload = {}
        with self.assertRaisesMessage(ValidationError, "Vous n'êtes pas autorisé à passer ce quiz"):
            submit_entire_quiz(self.user, other_quiz.id, payload)