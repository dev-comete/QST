import { useQuery } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";

const useQuiz = () => {

	const getAllQuiz = useQuery({
		queryKey: ['quiz_list'],
		queryFn: QuizService.list
	})

	return {
		getAllQuiz
	}
}

export default useQuiz