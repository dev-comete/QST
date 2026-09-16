import { useEffect, useState } from "react";
import type { respType, questionType } from "../../types/questionType";
import { initialQuestion } from "../../types/constant";
import { useBareme } from "../bareme/useBareme";
import { useQuestion } from "./useQuestion";
import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";

export const useQuestionCreate = () => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)

	const [ responses, setResponses ] = useState<respType[]>([])

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
		isPending: createQuestion.isPending
	}
}