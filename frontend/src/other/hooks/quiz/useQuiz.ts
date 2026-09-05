import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";
import { useEffect, useState } from "react";
import { useFormation } from "../formation/useFormation";
import type { quizCreateType } from "../../types/quizType";

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

export const useQuiz = (id ?: number) => {

	const getAllQuiz = useQuery({
		queryKey: ['quiz_list'],
		queryFn: QuizService.list
	})

	const infoQuestionQuiz = useQuery({
		queryKey: ['info_question_quiz', id],
		queryFn: () => QuizService.listQuestion(id ? id : 0),
		enabled: !!id
	})

	const infoQuiz = useQuery({
		queryKey: ['info_quiz', id],
		queryFn: () => QuizService.info(id ? id : 0),
		enabled: !!id
	})

	return {
		getAllQuiz,
		infoQuestionQuiz,
		infoQuiz
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

const initQuiz = {
	titre: '',
	formation: '',
	duree: '00:00:00',
	status: 'draft'
}

export const useQuizEdit = (id: number) => {

	const [quiz, setQuiz] = useState<quizCreateType>(initQuiz)
	const { formations } = useFormation()
	const queryClient = useQueryClient()
	const { infoQuiz } = useQuiz(id)
	
	const updateQuiz= useMutation({
		mutationFn: ({ id, data }: { id: number; data: quizCreateType }) => QuizService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['quiz_list'],
            });
		},
		onError: (err) => {
			console.error('Quiz update failed:', err);
		},
	});

	const handleQuizEdit = async () => {
		return await updateQuiz.mutateAsync({id, data: quiz})
	}

	useEffect(() => {

		if (!formations || !infoQuiz.data) return

		const initQuiz = infoQuiz.data

		setQuiz({
			titre: initQuiz.titre,
			formation: initQuiz.formation,
			duree: initQuiz.duree,
			status: initQuiz.status,
		})

	}, [formations, infoQuiz.data]);

	return {
		isPending : updateQuiz.isPending,
		handleQuizEdit,
		quiz,
		setQuiz,
	}
}
