// frontend/src/other/hooks/quiz/useReviewQuiz.ts
import { useQuery } from "@tanstack/react-query"
import { QuizService } from "../../services/quizService"

export const useReviewQuiz = (quizId: string, vagueId?: string, studentId?: string | null) => {

	const { data: review, status} = useQuery({
		queryKey: ['quiz_review', quizId, vagueId, studentId],
		queryFn: () => QuizService.reviewQuiz(quizId, vagueId ?? '', studentId),
		enabled: !!quizId && !!vagueId,
	})

	return {
		review,
		status
	}
}