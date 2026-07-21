from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import timedelta

from quizzes.models import Question, Reponse, Corrigee, Bareme, QuestionBareme, Quiz, UtilisateurQuiz
from quizzes.services import submit_entire_quiz

from accounts.models import TypeUtilisateur


from formations.models import Formation 

User = get_user_model()

class SubmitEntireQuizServiceTests(TestCase):
    
    def setUp(self):
        """Set up a complete quiz environment with 2 questions."""
        # 1. Create User
        self.type_formateur = TypeUtilisateur.objects.create(type_utilisateur="formateur")
        self.type_apprenant = TypeUtilisateur.objects.create(type_utilisateur="apprenant")

        self.formateur = User.objects.create_user(
            username="prof1", password="password123", email="prof@test.com", type_utilisateur=self.type_formateur
        )
        self.user = User.objects.create_user(
            username="student1", password="password123", email="student@test.com", type_utilisateur=self.type_apprenant
        )
        
        # 2. Create Formation and Quiz
        self.formation = Formation.objects.create(
            nom_formation="Formation Test", 
            createur=self.formateur
        )

        self.quiz = Quiz.objects.create(
            formation=self.formation, 
            duree=timedelta(minutes=15),
            status="Actif" # Ajoutez le statut que vous utilisez normalement
        )
        
        # 3. Create Question 1 (QCM - 5 points)
        self.q1 = Question.objects.create(enonce_question="Langages Orientés Objet ?")
        self.q1_rep_java = Reponse.objects.create(reponse="Java")
        self.q1_rep_python = Reponse.objects.create(reponse="Python")
        Corrigee.objects.create(question=self.q1, reponse=self.q1_rep_java)
        Corrigee.objects.create(question=self.q1, reponse=self.q1_rep_python)
        
        bareme_5 = Bareme.objects.create(pts=5.0)
        QuestionBareme.objects.create(question=self.q1, bareme=bareme_5)

        # 4. Create Question 2 (QCU - 2 points)
        self.q2 = Question.objects.create(enonce_question="Balise pour un gros titre HTML ?")
        self.q2_rep_h1 = Reponse.objects.create(reponse="<h1>")
        self.q2_rep_div = Reponse.objects.create(reponse="<div>")
        Corrigee.objects.create(question=self.q2, reponse=self.q2_rep_h1) # Only h1 is correct
        
        bareme_2 = Bareme.objects.create(pts=2.0)
        QuestionBareme.objects.create(question=self.q2, bareme=bareme_2)

    def test_student_takes_entire_quiz(self):
        """Test submitting a full quiz dictionary and calculating the final score."""
        
        # 1. Construct the payload simulating JSON from the frontend
        # Alice gets Q1 perfect, and Q2 perfect
        quiz_payload = {
            str(self.q1.id): [self.q1_rep_java.id, self.q1_rep_python.id],
            str(self.q2.id): [self.q2_rep_h1.id]
        }
        
        # 2. Run the Orchestrator service
        quiz_attempt = submit_entire_quiz(
            user=self.user,
            quiz_id=self.quiz.id,
            quiz_payload=quiz_payload
        )
        
        # 3. VERIFY FOR THE CODE (Assertions)
        # Did it create the summary record correctly?
        self.assertTrue(quiz_attempt.termine)
        self.assertEqual(quiz_attempt.score_obtenu, 7.0) # 5 + 2 points
        
        # Did it save exactly 2 individual Valiny attempts?
        self.assertEqual(self.user.valiny_set.count(), 2)

        # 4. SHOW FOR THE DEVELOPER (Console Output)
        print("\n" + "="*50)
        print("🏆 TEST PASSED: ENTIRE QUIZ SUBMISSION")
        print("="*50)
        print(f"🎓 Apprenant  : {quiz_attempt.utilisateur.username}")
        print(f"📚 Formation  : {self.quiz.formation.nom_formation}")
        print(f"📝 Quiz ID    : {self.quiz.id}")
        print(f"✅ Terminé    : {quiz_attempt.termine}")
        print(f"💯 Score Final: {quiz_attempt.score_obtenu} / 7.0 pts")
        print("="*50 + "\n")