import { useEffect, useState, type ReactNode } from "react"
import { initialQuestion } from "../../other/types/constant"
import type { questionType } from "../../other/types/questionType"
import { QuestionService } from "../../other/services/questionService"
import { useMutation } from "@tanstack/react-query"
import { QuestionCreateContext } from "../../other/hooks/question/useQuestionCreate"
import { useQuestion } from "../../other/hooks/question/useQuestion"

export const QuestionCreateProvider = ({ children }: { children: ReactNode }) => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)

	const { questionTypeQuery, baremeQuery } = useQuestion()
	// const questionTypeQuery = useQuery({
	// 	queryKey: ['question_type'],
	// 	queryFn: QuestionService.getTypeQuestion
	// })

	// const baremeQuery = useQuery({
	// 	queryKey: ['bareme'],
	// 	queryFn: QuestionService.getBareme
	// })

	const { mutate } = useMutation({
		mutationFn: QuestionService.create,
		onSuccess: () => {
			console.log("Success : question created")
		},
		onError: (err) => {
			console.error('Error: question creation failed:', err);
		},
	});

	const handleCreate = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		//Check question validity here !!!!
		mutate(question)
	}

	useEffect(() => {

		const initQuestion = async () => {
			if (questionTypeQuery.data?.[0] && baremeQuery.data?.[0]) {
				setQuestion((prev) => ({
					...prev,
					type_id: questionTypeQuery.data[0].id,
					bareme_pts: baremeQuery.data[0].pts,
				}));
			}
		}

		initQuestion()

    }, [questionTypeQuery.data, baremeQuery.data]);

	return (
		<QuestionCreateContext.Provider value={{ question, setQuestion, handleCreate, baremeQuery, questionTypeQuery }}>
			{children}
		</QuestionCreateContext.Provider>
	)
}