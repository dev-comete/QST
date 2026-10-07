import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QuestionService } from "../../services/questionService"
import { useEffect, useState } from "react"
import type { QuestionTypePayload } from "../../types/questionType"

export const useCreateQuestionType = () => {

	const [ questionType, setQuestionType ] = useState<QuestionTypePayload>({
		type_question: '',
		code: ''
	})

	const queryClient = useQueryClient()

	const createQuestionType = useMutation({
		mutationFn: QuestionService.createTypeQuestion,
		onSuccess: () => {
			setQuestionType({ type_question: '', code: ''})
			queryClient.invalidateQueries({
                queryKey: ['question_type_list'],
            });
			
		},
		onError: (err) => {
			console.error('Question type creation failed:', err);
		},
	});

	const handleCreateQuestionType = async () => {
		if (questionType.type_question.trim().length == 0
			|| questionType.code.trim().length == 0) 
			return

		return await createQuestionType.mutateAsync(questionType)
	}

	return {
		questionType, setQuestionType,
		handleCreateQuestionType,
		isPending : createQuestionType.isPending,
	}
}

export const useQuestionType = (id ?: number) => {
	const questionTypeQuery = useQuery({
		queryKey: ['question_type_list'],
		queryFn: QuestionService.getTypeQuestion,
	})

	const infoQuestionTypeQuery = useQuery({
		queryKey: ['question_type_info', id],
		queryFn: () => QuestionService.infoTypeQuestion(id ? id : 0),
		enabled: !!id
	})

	return {
		questionTypeQuery,
		infoQuestionTypeQuery
	}
}

export const useEditQuestionType = (id: number) => {

	const [ questionType, setQuestionType ] = useState<QuestionTypePayload>({
		type_question: '',
		code: ''
	})

	const { infoQuestionTypeQuery } = useQuestionType(id)

	const queryClient = useQueryClient()

	useEffect(() => {
		if (!infoQuestionTypeQuery.data) return
		setQuestionType(infoQuestionTypeQuery.data)
	}, [id, infoQuestionTypeQuery.data])

	const createQuestionType = useMutation({
		mutationFn: ({ id, data }: { id: number; data: QuestionTypePayload }) => QuestionService.editTypeQuestion(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['question_type_list'],
            });
			
		},
		onError: (err) => {
			console.error('Question type edit failed:', err);
		},
	});

	const handleEditQuestionType = async () => {
		if (questionType.type_question.trim().length == 0
			|| questionType.code.trim().length == 0) 
			return

		return await createQuestionType.mutateAsync({id, data: questionType})
	}

	return {
		questionType, setQuestionType,
		handleEditQuestionType,
		isPending : createQuestionType.isPending,
	}
}