import { useMutation, useQuery } from "@tanstack/react-query";
import { QuizService } from "../../services/quizService";
import { useEffect, useState } from "react";
import type { quizCreateType } from "../../types/quizType";

const initQuiz = {
	formation: '',
	duree: '00:00:00',
	status: 'draft'
}

const useCreateQuiz = () => {

	const [quiz, setQuiz] = useState<quizCreateType>(initQuiz)

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

	const formationQuery = useQuery({
		queryKey: ['formation_list'],
		queryFn: QuizService.getFormation
	})

	const getAllQuiz = useQuery({
		queryKey: ['quiz_list'],
		queryFn: QuizService.getAllQuiz
	})

	useEffect(() => {

		const initQuestion = async () => {
			if (formationQuery.data?.[0]) {
				setQuiz((prev) => ({
					...prev,
					formation: String(formationQuery.data[0].id),
				}));
			}
		}

		initQuestion()

	}, [formationQuery.data]);

	return {
		status,
		handleQuizSubmit,
		formationQuery,
		quiz,
		setQuiz,
		getAllQuiz
	}
}

export default useCreateQuiz