import { useQuery } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";

const useQuestion = () => {

	const getAllQuestion = useQuery({
		queryKey: ['bank_question'],
		queryFn: QuestionService.getAllQuestion
	})

	return {
		getAllQuestion
	}
}

export {
	useQuestion,
}