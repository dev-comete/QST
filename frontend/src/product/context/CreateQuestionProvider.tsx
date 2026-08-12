import { useEffect, useState, type ReactNode } from "react"
import { CreateQuestionContext } from "../../other/hooks/useQuestion"
import { initialQuestion } from "../../other/types/constant"
import type { questionType } from "../../other/types/questionType"
import { QuestionService } from "../../other/services/questionService"
import { useMutation, useQuery } from "@tanstack/react-query"

export const CreationQuestionProvider = ({ children }: { children: ReactNode }) => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)

	const questionTypeQuery = useQuery({
		queryKey: ['question_type'],
		queryFn: QuestionService.getTypeQuestion
	})

	const baremeQuery = useQuery({
		queryKey: ['bareme'],
		queryFn: QuestionService.getBareme
	})

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
        if (questionTypeQuery.data?.[0] && baremeQuery.data?.[0]) {
            setQuestion((prev) => ({
                ...prev,
                type_id: questionTypeQuery.data[0].id,
                bareme_pts: baremeQuery.data[0].pts,
            }));
        }
    }, [questionTypeQuery.data, baremeQuery.data]);

	return (
		<CreateQuestionContext.Provider value={{ question, setQuestion, handleCreate, baremeQuery, questionTypeQuery }}>
			{children}
		</CreateQuestionContext.Provider>
	)
}