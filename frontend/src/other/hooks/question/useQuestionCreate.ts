import { useEffect, useState } from "react";
import type { respType, questionType } from "../../types/questionType";
import { initialQuestion } from "../../types/constant";
import { useBareme } from "../bareme/useBareme";
import { useQuestion } from "./useQuestion";
import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import { checkOptionValidation } from "../../helper/helper";

export const useQuestionCreate = () => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)
	const [ responses, setResponses ] = useState<respType[]>([])

	const [ errorMsg, setErrorMsg ] = useState<string | null>(null)

	const { questionTypeQuery } = useQuestion()
	const { baremeQuery } = useBareme()

	const createQuestion = useMutation({
		mutationFn: QuestionService.create,
		onSuccess: () => {
			setQuestion(initialQuestion)
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
			setErrorMsg("L'énoncé est obligatoire")
			return
		}

		if (checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '') == false){
			setErrorMsg("Les options de réponses ne sont pas respectées")
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
		errorMsg,
		setErrorMsg
	}
}