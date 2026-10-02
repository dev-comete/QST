import { useState } from "react"
import type { assignQuestionType } from "../../types/questionType"
import { useParams } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QuizService } from "../../services/quizService"

const useAssignQuiz = () => {

	const [ selectedQuestion, setSelectedQuestion ] = useState<assignQuestionType[]>([])
	const queryClient = useQueryClient()
	const { id } = useParams();

	const { mutate, status } = useMutation({
		mutationFn: QuizService.assignQuestion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['info_question_quiz', Number(id)]})
			queryClient.invalidateQueries({ queryKey: ['info_quiz', Number(id)]})
			setSelectedQuestion([])
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
				type_id: q.type_id,
				bareme_pts: q.bareme_pts
			}))
		};

		mutate(payload)
	}


	return {
		selectedQuestion,
		setSelectedQuestion,
		handleAssignQuestion,
		status
	}
}

export default useAssignQuiz