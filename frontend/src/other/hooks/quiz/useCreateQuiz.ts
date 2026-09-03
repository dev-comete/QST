import { useMutation, useQuery } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";
import { useEffect, useState } from "react";
import type { quizCreateType } from "../../types/quizType";
import { useFormation } from "../formation/useFormation";

const initQuiz = {
	formation: '',
	duree: '00:00:00',
	status: 'draft'
}

const useCreateQuiz = () => {

	const [quiz, setQuiz] = useState<quizCreateType>(initQuiz)
	const { formations } = useFormation()

	const { mutate, status } = useMutation({
		mutationFn: QuizService.create,
		onSuccess: (data) => {
			console.log("Quiz created", data)
		},
		onError: (err) => {
			console.error('Quiz creation failed:', err);
		},
	});

	const handleQuizSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutate(quiz);
	}

	const getAllQuiz = useQuery({
		queryKey: ['quiz_list'],
		queryFn: QuizService.list
	})

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
		status,
		handleQuizSubmit,
		quiz,
		setQuiz,
		getAllQuiz
	}
}

export default useCreateQuiz