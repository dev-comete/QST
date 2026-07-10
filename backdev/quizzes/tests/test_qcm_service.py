from django.test import TestCase
from django.contrib.auth import get_user_model
from quizzes.models import Question, Reponse, Corrigee, Bareme, QuestionBareme
from quizzes.services import submit_qcm_answer

User = get_user_model()

class SubmitQCMAnswerServiceTests(TestCase):
    
    def setUp(self):
        """
        setUp runs before every single test. 
        We use it to create dummy data in the temporary test database.
        """
        # 1. Create a test user
        self.user = User.objects.create_user(
            username="teststudent", 
            email="student@test.com", 
            password="password123"
        )
        
        # 2. Create a Question
        self.question = Question.objects.create(
            enonce_question="Lesquels de ces langages sont orientés objet ?"
        )
        
        # 3. Create Responses (Options)
        self.rep_java = Reponse.objects.create(reponse="Java")
        self.rep_python = Reponse.objects.create(reponse="Python")
        self.rep_html = Reponse.objects.create(reponse="HTML")
        
        # 4. Define the Answer Key (Corrigée) -> Java and Python are correct
        Corrigee.objects.create(question=self.question, reponse=self.rep_java)
        Corrigee.objects.create(question=self.question, reponse=self.rep_python)
        
        # 5. Set up the grading scale (Barème) -> 5.0 points for this question
        self.bareme = Bareme.objects.create(pts=5.0)
        QuestionBareme.objects.create(question=self.question, bareme=self.bareme)

 

    def test_submit_perfect_answer(self):
        """Test if a student gets full points and verify all linked info."""
        # 1. The student submits both Java and Python
        submitted_ids = [self.rep_java.id, self.rep_python.id]
        
        # 2. Call our service layer
        valiny = submit_qcm_answer(
            user=self.user, 
            question_id=self.question.id, 
            submitted_reponse_ids=submitted_ids
        )
        
        # 3. VERIFY FOR THE CODE (Assertions)
        # Check that it linked to the correct user
        self.assertEqual(valiny.utilisateur, self.user)
        self.assertEqual(valiny.utilisateur.username, "teststudent")
        
        # Check that it linked to the correct question
        self.assertEqual(valiny.question, self.question)
        self.assertEqual(valiny.question.enonce_question, "Lesquels de ces langages sont orientés objet ?")

        # Check the grading math
        self.assertTrue(valiny.vrai_ou_faux)
        self.assertEqual(valiny.pts, 5.0)
        self.assertEqual(valiny.reponses_choisies.count(), 2)

        # 4. SHOW FOR THE DEVELOPER (Console Output)
        print("\n" + "="*50)
        print("✅ TEST PASSED: PERFECT ANSWER")
        print("="*50)
        print(f"🎓 Apprenant : {valiny.utilisateur.username} ({valiny.utilisateur.email})")
        print(f"❓ Question  : {valiny.question.enonce_question}")
        
        # Get the text of the choices they made
        choix_text = [rep.reponse for rep in valiny.reponses_choisies.all()]
        print(f"📝 Choix     : {choix_text}")
        
        print(f"🎯 Résultat  : {'Correct' if valiny.vrai_ou_faux else 'Incorrect'}")
        print(f"⭐️ Points    : {valiny.pts} pts")
        print("="*50 + "\n")

    def test_submit_partial_wrong_answer(self):
        """Test if a student gets 0 points for missing an option."""
        # The student only submits Java (missing Python)
        submitted_ids = [self.rep_java.id]
        
        valiny = submit_qcm_answer(
            user=self.user, 
            question_id=self.question.id, 
            submitted_reponse_ids=submitted_ids
        )
        
        self.assertFalse(valiny.vrai_ou_faux)
        self.assertEqual(valiny.pts, 0.0)

    def test_submit_completely_wrong_answer(self):
        """Test if a student gets 0 points for picking a wrong option."""
        # The student submits HTML (which is wrong) and Java
        submitted_ids = [self.rep_java.id, self.rep_html.id]
        
        valiny = submit_qcm_answer(
            user=self.user, 
            question_id=self.question.id, 
            submitted_reponse_ids=submitted_ids
        )
        
        self.assertFalse(valiny.vrai_ou_faux)
        self.assertEqual(valiny.pts, 0.0)
