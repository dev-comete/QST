import { useEffect, useState } from "react";
import type { respType, questionType } from "../../types/questionType";
import { initialQuestion } from "../../types/constant";
import { useBareme } from "../bareme/useBareme";
import { useQuestion } from "./useQuestion";
import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { checkOptionValidation } from "../../helper/helper";

type criteria = {
	msg: string,
	correctMsg: string,
	falseMsg: string,
	trueCondition: boolean,
	correctCount: number,
	currentCorrectCount: number,
	falseCondition: boolean,
	falseCount: number,
	currentFalseCount: number
}

export const buildValidationCriteria = (responses: respType[], typeCode?: string) : criteria => {

	const currentCorrectCount = responses.filter((r) => r.est_correct).length;
    const currentFalseCount = responses.filter((r) => !r.est_correct).length;

	switch (typeCode) {
		case 'QCM':
			return {
				msg: 'Une question QCM requiert',
				correctMsg: 'au moins deux vraies réponses',
				falseMsg: 'au moins une fausse',
				trueCondition: currentCorrectCount >= 2,
				correctCount: 2,
				currentCorrectCount,
				falseCondition: currentFalseCount >= 1,
				falseCount: 1,
				currentFalseCount
			}

		case 'QCU':
			return {
				msg: 'Une question QCU requiert',
				correctMsg: 'une seule vraie réponse',
				falseMsg: 'au moins une fausse',
				trueCondition: currentCorrectCount === 1,
				correctCount: 1,
				falseCondition: currentFalseCount >= 1,
				falseCount: 1,
				currentCorrectCount,
				currentFalseCount
			}

		default:
			return {
				msg: 'Une question ouverte ne nécessite pas de proposition de réponses',
				correctMsg: '',
				falseMsg: '',
				trueCondition: currentCorrectCount == 0,
				correctCount: 0,
				falseCondition: currentFalseCount == 0,
				falseCount: 0,
				currentCorrectCount,
				currentFalseCount
			}
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

	const [ selectedQuestionType, setSelectedQuestionType ] = useState('')

	const setErrorMsg = (msg: string, type: string = 'error') => {
		setErrorForm({ msg, type })
	}

	const { questionTypeQuery } = useQuestion({})
	const { baremeQuery } = useBareme()
	const [ isOuvert, setIsOuvert ] = useState(false)

	useEffect(() => {
		const selectedType = questionTypeQuery.data?.find((q) => q.id === question.type_id)?.code ?? 'QCM';
		if (selectedType == 'OUV'){
			setIsOuvert(true)
		} else {
			setIsOuvert(false)
		}
		setSelectedQuestionType(selectedType)
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

		if (isOuvert) {
			setResponses([])
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
				bareme_pts: baremeQuery.data.length != 0 ? baremeQuery.data[0].pts : 1,
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
		isOuvert,
		selectedQuestionType
	}
}