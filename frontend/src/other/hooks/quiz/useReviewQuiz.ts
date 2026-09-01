import { useQuery } from "@tanstack/react-query"
import { QuizService } from "../../services/quizService"

export const useReviewQuiz = (quizId: string) => {

	const { data: correction, status} = useQuery({
		queryKey: ['quiz_review', quizId],
		queryFn: () => QuizService.reviewQuiz(quizId)
	})

	return {
		correction,
		status
	}
}