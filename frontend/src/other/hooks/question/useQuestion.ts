import { useQuery } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";

const useQuestion = () => {

	const getAllQuestion = useQuery({
		queryKey: ['bank_question'],
		queryFn: QuestionService.getAllQuestion
	})

	const questionTypeQuery = useQuery({
		queryKey: ['question_type'],
		queryFn: QuestionService.getTypeQuestion
	})

	const baremeQuery = useQuery({
		queryKey: ['bareme'],
		queryFn: QuestionService.getBareme
	}) 

	return {
		getAllQuestion,
		questionTypeQuery,
		baremeQuery
	}
}

export {
	useQuestion,
}