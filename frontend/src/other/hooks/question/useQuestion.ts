import { useMutation, useQuery, useQueryClient , keepPreviousData} from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
// import { useEffect, useState } from "react";
// import type { bankQuestionType, respType } from "../../types/questionType";
import { useQuestionType } from "./useQuestionType";

export const useQuestionDel = (id: number) => {

	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: QuestionService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bank_question'] })
		},
		onError: (err) => {
			console.error('Question deletion failed:', err);
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

export const useQuestionRestore = (id: number) => {

	const queryClient = useQueryClient()

	const restoreMutation = useMutation({
		mutationFn: QuestionService.restore,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bank_question'] })
		},
		onError: (err) => {
			console.error('Question restoration failed:', err);
		},
	});

	const handleQuestionRestore = async () => {
		return await restoreMutation.mutateAsync(id)
	}

	return {
		handleQuestionRestore,
		isPending: restoreMutation.isPending
	}
}

type UseQuestionParams = {
	id?: string
	search?: string
	type?: string
	page?: number
	pageSize?: number
	timer?: string
	listType?: string
}

const useQuestion = ({ id, search, type, page, pageSize , listType } : UseQuestionParams) => {

	const { questionTypeQuery } = useQuestionType()

	const list = useQuery({
		queryKey: ['bank_question', search, type, page, pageSize, listType],
		queryFn: () => QuestionService.list({ search, type, page, pageSize,listType }),
		placeholderData: keepPreviousData,
	})

	const infoQuestionQuery = useQuery({
		queryKey: ['question_info', id],
		queryFn: () => QuestionService.info(id ? id : ''),
		enabled: !!id
	})

	return {
		list,
		questionTypeQuery,
		infoQuestionQuery,
	}
}

//Not functionnal yet
// const useQuestionEdit = (id: string | number) => {
// 	const { detailQuestionQuery } = useQuestion({ id: String(id) })
// 	const [ question, setQuestion ] = useState<bankQuestionType>()
// 	const [ responses, setResponses ] = useState<respType[]>([
// 		{ reponse: '', est_correct: true, explication: '' },
// 		{ reponse: '', est_correct: false, explication: '' },
// 	])
// 	const [ errorForm, setErrorForm ] = useState<{
// 		msg: string | null,
// 		type: string
// 	}>({msg: null, type: ''})

// 	const setErrorMsg = (msg: string, type: string = 'error') => {
// 		setErrorForm({ msg, type })
// 	}

// 	const { questionTypeQuery } = useQuestion({})
// 	const [ isOuvert, setIsOuvert ] = useState(false)

// 	useEffect(() => {
// 		const initQuestion = async () => {
			
// 			if (!detailQuestionQuery.data) return

// 			const initQuestion = detailQuestionQuery.data

// 			setQuestion({
// 				id: initQuestion.id,
// 				enonce_question: initQuestion.enonce_question,
// 				reponses: initQuestion.reponses
// 			});
// 		}

// 		initQuestion()
// 	}, [detailQuestionQuery])

// 	const editQuestion = useMutation({
// 		mutationFn: QuestionService.edit,
// 		onSuccess: () => {
// 			setErrorForm({msg: null, type: ''})
// 		},
// 		onError: (err) => {
// 			console.log("Erreur", err)
// 		},
// 	});

// 	const handleEdit = async () => {

// 		const { data: questionType } = questionTypeQuery

// 		if (!questionType) {
// 			setErrorMsg("Il n'y a pas de type de question disponible")
// 			return
// 		}

// 		if (question && question.enonce_question.trim().length == 0) {
// 			setErrorMsg("L'énoncé de la question est obligatoire")
// 			return
// 		}

// 		// if (!isOuvert && checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '') == false){
// 		// 	setErrorMsg("Les options de réponses ne sont pas respectées", 'response')
// 		// 	return
// 		// }

// 		const payload = {
// 			...question,
// 			options: responses,
// 		};

// 		// return await editQuestion.mutateAsync(payload)
// 	}

// 	// useEffect(() => {

// 	// 	const initQuestion = async () => {

// 	// 		setQuestion((prev) => ({
// 	// 			...prev,
// 	// 		}));
// 	// 	}

// 	// 	initQuestion()

//     // }, []);

// 	return {
// 		question,
// 		setQuestion,
// 		responses,
// 		setResponses,
// 		handleCreate: handleEdit,
// 		questionTypeQuery,
// 		isPending: editQuestion.isPending,
// 		errorForm,
// 		setErrorMsg,
// 		isOuvert,
// 		setIsOuvert
// 	}
// }

export {
	useQuestion,
	// useQuestionEdit
}