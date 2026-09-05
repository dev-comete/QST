import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";

export const useQuizDel = (id: number) => {
	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: QuizService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['quiz_list'] })
		},
		onError: (err) => {
			console.error('Quiz deletion failed:', err);
		},
	});

	const handleDelQuiz = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelQuiz,
		isPending: deleteMutation.isPending
	}
}

export const useQuiz = () => {

	const getAllQuiz = useQuery({
		queryKey: ['quiz_list'],
		queryFn: QuizService.list
	})

	return {
		getAllQuiz
	}
}

export const useQuizUpdate = (id: number, status: string) => {
	const queryClient = useQueryClient()

	const updateMutation = useMutation({
		mutationFn: ({ id, status }: { id: number; status: string }) => QuizService.updateStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['quiz_list']})
		},
		onError: (err) => {
			console.error('Quiz status update failed:', err);
		},
	});

	const handleUpdateStatus = async () => {
		console.log(status)
		const newStatus = status == 'draft' ? 'published' : 'draft'
		return await updateMutation.mutateAsync({id, status : newStatus})
	}

	return {
		handleUpdateStatus,
		isPending: updateMutation.isPending
	}
}
