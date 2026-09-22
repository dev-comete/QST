import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME, initialQuestion } from "../../types/constant";
import { useEffect, useState } from "react";
import type { bankQuestionType, questionType, respType } from "../../types/questionType";
import { checkOptionValidation } from "../../helper/helper";

export const useQuestionDel = (id: number) => {

	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: QuestionService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bank_question'] })
		},
		onError: (err) => {
			console.error('Organisation creation failed:', err);
		},
	});

	const handleQuestionDel = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleQuestionDel,
		isPending: deleteMutation.isPending
	}
}

const useQuestion = (id?: string) => {

	const list = useQuery({
		queryKey: ['bank_question'],
		queryFn: QuestionService.list
	})

	const questionTypeQuery = useQuery({
		queryKey: ['question_type_list'],
		queryFn: QuestionService.getTypeQuestion,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME,
	})

	const infoQuestionQuery = useQuery({
		queryKey: ['question_info', id],
		queryFn: () => QuestionService.info(id ? id : ''),
		enabled: !!id
	})

	const detailQuestionQuery = useQuery({
		queryKey: ['question_detail', id],
		queryFn: () => QuestionService.detail(id ? id : ''),
		enabled: !!id
	})

	return {
		list,
		questionTypeQuery,
		infoQuestionQuery,
		detailQuestionQuery
	}
}

const useQuestionEdit = (id: string | number) => {
	const { detailQuestionQuery } = useQuestion(String(id))
	const [ question, setQuestion ] = useState<bankQuestionType>()
	const [ responses, setResponses ] = useState<respType[]>([
		{ reponse: '', est_correct: true, explication: '' },
		{ reponse: '', est_correct: false, explication: '' },
	])
	const [ errorForm, setErrorForm ] = useState<{
		msg: string | null,
		type: string
	}>({msg: null, type: ''})

	const setErrorMsg = (msg: string, type: string = 'error') => {
		setErrorForm({ msg, type })
	}

	const { questionTypeQuery } = useQuestion()
	const [ isOuvert, setIsOuvert ] = useState(false)

	useEffect(() => {
		const initQuestion = async () => {
			
			if (!detailQuestionQuery.data) return

			const initQuestion = detailQuestionQuery.data

			setQuestion({
				id: initQuestion.id,
				enonce_question: initQuestion.enonce_question,
				reponses: initQuestion.reponses
			});
		}

		initQuestion()
	}, [detailQuestionQuery])

	const editQuestion = useMutation({
		mutationFn: QuestionService.edit,
		onSuccess: () => {
			setErrorForm({msg: null, type: ''})
		},
		onError: (err) => {
			console.log("Erreur", err)
		},
	});

	const handleEdit = async () => {

		const { data: questionType } = questionTypeQuery

		if (!questionType) {
			setErrorMsg("Il n'y a pas de type de question disponible")
			return
		}

		if (question.enonce_question.trim().length == 0) {
			setErrorMsg("L'énoncé de la question est obligatoire")
			return
		}

		// if (!isOuvert && checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '') == false){
		// 	setErrorMsg("Les options de réponses ne sont pas respectées", 'response')
		// 	return
		// }

		const payload = {
			...question,
			options: responses,
		};

		return await editQuestion.mutateAsync(payload)
	}

	useEffect(() => {

		const initQuestion = async () => {

			setQuestion((prev) => ({
				...prev,
			}));
		}

		initQuestion()

    }, []);

	return {
		question,
		setQuestion,
		responses,
		setResponses,
		handleCreate: handleEdit,
		questionTypeQuery,
		isPending: editQuestion.isPending,
		errorForm,
		setErrorMsg,
		isOuvert
	}
}

export {
	useQuestion,
	useQuestionEdit
}