import { useEffect, useState } from "react";
import type { respType, questionType } from "../../types/questionType";
import { initialQuestion } from "../../types/constant";
import { useBareme } from "../bareme/useBareme";
import { useQuestion } from "./useQuestion";
import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { checkOptionValidation } from "../../helper/helper";

const buildInitialResponses = (typeCode?: string): respType[] => {
	switch (typeCode) {
		case 'QCM':
		return [
			{ reponse: '', est_correct: true, explication: '' },
			{ reponse: '', est_correct: true, explication: '' },
			{ reponse: '', est_correct: false, explication: '' },
		]

		case 'QCU':
		return [
			{ reponse: '', est_correct: true, explication: '' },
			{ reponse: '', est_correct: false, explication: '' },
		]

		case 'OUV':
		return []

		default:
		return [
			{ reponse: '', est_correct: true, explication: '' },
			{ reponse: '', est_correct: false, explication: '' },
		]
	}
}

export const useQuestionCreate = () => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)
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
	const { baremeQuery } = useBareme()
	const [ isOuvert, setIsOuvert ] = useState(false)

	useEffect(() => {
		const selectedType = questionTypeQuery.data?.find((q) => q.id === question.type_id)?.code ?? 'QCM';
		if (selectedType == 'OUV'){
			setIsOuvert(true)
		} else {
			setIsOuvert(false)
		}
		setResponses(buildInitialResponses(selectedType))
	}, [questionTypeQuery.data, question.type_id])

	const createQuestion = useMutation({
		mutationFn: QuestionService.create,
		onSuccess: () => {
			setQuestion(initialQuestion)
			setResponses([])
			setErrorForm({msg: null, type: ''})
		},
		onError: (err) => {
			console.log("Erreur", err)
		},
	});

	const handleCreate = async () => {

		const { data: questionType } = questionTypeQuery

		if (!questionType) {
			setErrorMsg("Il n'y a pas de type de question disponible")
			return
		}

		if (question.enonce_question.trim().length == 0) {
			setErrorMsg("L'énoncé de la question est obligatoire")
			return
		}

		if (!isOuvert && checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '') == false){
			setErrorMsg("Les options de réponses ne sont pas respectées", 'response')
			return
		}

		const payload = {
			...question,
			options: responses,
		};

		return await createQuestion.mutateAsync(payload)
	}

	useEffect(() => {

		const initQuestion = async () => {

			if (!questionTypeQuery.data?.length || !baremeQuery.data) return 

			setQuestion((prev) => ({
				...prev,
				type_id: questionTypeQuery.data[0].id,
				bareme_pts: baremeQuery.data[0].pts,
			}));
		}

		initQuestion()

    }, [questionTypeQuery.data, baremeQuery.data]);

	return {
		question,
		setQuestion,
		responses,
		setResponses,
		handleCreate,
		questionTypeQuery,
		isPending: createQuestion.isPending,
		errorForm,
		setErrorMsg,
		isOuvert
	}
}