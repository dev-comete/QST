import { useQuery } from "@tanstack/react-query"
import { QuizService } from "../../services/quizService"

export const useReviewQuiz = (quizId: string, vagueId?: string) => {

	const { data: review, status} = useQuery({
		queryKey: ['quiz_review', quizId, vagueId],
		queryFn: () => QuizService.reviewQuiz(quizId, vagueId ?? ''),
		enabled: !!quizId && !!vagueId,
	})

	return {
		review,
		status
	}
}