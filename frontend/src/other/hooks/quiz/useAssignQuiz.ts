import { useState } from "react"
import type { assignQuestionType } from "../../types/questionType"
import { useParams } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { QuizService } from "../../services/quizService"
import { useAppNavigation } from "../navigation/useAppNavigation"

const useAssignQuiz = () => {

	const [ selectedQuestion, setSelectedQuestion ] = useState<assignQuestionType[]>([])

	const { id } = useParams();
	const { navigateTo} = useAppNavigation()

	const { mutate, status } = useMutation({
		mutationFn: QuizService.assignQuestion,
		onSuccess: (data) => {
			console.log("Quiz created", data)
		},
		onError: (err) => {
			console.error('Quiz creation failed:', err);
		},
	});


	const handleAssignQuestion = () => {
		// Validation : Vérifier que toutes les questions ont un type et un barème
		// const isValid = selectedQuestion.every(q => q.bareme_pts !== '');
		// if (!isValid) {
		//   setError("Veuillez sélectionner un type et un barème pour toutes les questions choisies.");
		//   return;
		// }

		const payload = {
			quiz_id: Number(id ?? 0),
			questions_choisies: selectedQuestion.map(q => ({
				question_id: q.id,
				type_id: 1,
				bareme_pts: q.bareme_pts
			}))
		};

		mutate(payload)
		navigateTo(`gestion_quiz`)
	}


	return {
		selectedQuestion,
		setSelectedQuestion,
		handleAssignQuestion,
		status
	}
}

export default useAssignQuiz