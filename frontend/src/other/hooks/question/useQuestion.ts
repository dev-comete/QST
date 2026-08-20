import { useQuery } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant";

const useQuestion = () => {

	const getAllQuestion = useQuery({
		queryKey: ['bank_question'],
		queryFn: QuestionService.getAllQuestion
	})

	const questionTypeQuery = useQuery({
		queryKey: ['question_type_list'],
		queryFn: QuestionService.getTypeQuestion,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME,
	})

	const baremeQuery = useQuery({
		queryKey: ['bareme_list'],
		queryFn: QuestionService.getBareme,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME,
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