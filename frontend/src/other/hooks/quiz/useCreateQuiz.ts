import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";
import { useEffect, useState } from "react";
import type { quizCreateType } from "../../types/quizType";
import { useFormation } from "../formation/useFormation";

const initQuiz = {
	titre: '',
	formation: '',
	duree: '00:00:00',
	status: 'draft'
}

const useCreateQuiz = () => {

	const [quiz, setQuiz] = useState<quizCreateType>(initQuiz)
	const { formations } = useFormation()
	const queryClient = useQueryClient()

	const createQuiz= useMutation({
		mutationFn: QuizService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['quiz_list'],
            });
		},
		onError: (err) => {
			console.error('Quiz creation failed:', err);
		},
	});

	const handleQuizSubmit = async () => {
		return await createQuiz.mutateAsync(quiz)
	}

	useEffect(() => {

		if (!formations) return

		const initQuestion = async () => {
			if (formations[0]) {
				setQuiz((prev) => ({
					...prev,
					formation: String(formations[0].id),
				}));
			}
		}

		initQuestion()

	}, [formations]);

	return {
		isPending : createQuiz.isPending,
		handleQuizSubmit,
		quiz,
		setQuiz,
	}
}

export default useCreateQuiz