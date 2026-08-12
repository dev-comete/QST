import { useQuery } from "@tanstack/react-query";
import { QuestionService } from "../services/questionService";

const useQuestion = () => {

	const getAllQuestion = useQuery({
		queryKey: ['question_list'],
		queryFn: QuestionService.getAllQuestion
	})

	return {
		// status,
		// handleCreate,
		getAllQuestion
	}
}

export {
	useQuestion,
}