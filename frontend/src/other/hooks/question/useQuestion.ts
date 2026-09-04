import { useQuery } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant";

// export const useQuestionDel = (id: number) => {

// 	const queryClient = useQueryClient()

// 	const deleteMutation = useMutation({
// 		mutationFn: QuestionService.delete,
// 		onSuccess: () => {
// 			queryClient.invalidateQueries({ queryKey: ['bank_question'] })
// 		},
// 		onError: (err) => {
// 			console.error('Organisation creation failed:', err);
// 		},
// 	});

// 	const handleQuestionDel = async () => {
// 		return await deleteMutation.mutateAsync(id)
// 	}

// 	return {
// 		handleQuestionDel,
// 		isPending: deleteMutation.isPending
// 	}
// }

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

	return {
		getAllQuestion,
		questionTypeQuery,
	}
}

export {
	useQuestion,
}