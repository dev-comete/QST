import { useMutation, useQuery } from "@tanstack/react-query";
import { QuestionService } from "../services/questionService";
import type { questionType } from "../types/questionType";
import { createContext, useContext, type Dispatch, type SetStateAction } from "react";


interface CreateQuestionContextType {
	question: questionType,
	setQuestion: Dispatch<SetStateAction<questionType>>;
}

const CreateQuestionContext = createContext<CreateQuestionContextType | undefined>(undefined);

const useCreateQuestion = () => {
	const context = useContext(CreateQuestionContext);
	if (!context) throw new Error('useCreateQuestion must be used within an AuthProvider');
	return context;
}

const useQuestion = () => {

	const { question } = useCreateQuestion()

	const { mutate, status } = useMutation({
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

		console.log("Question = ", question)
		mutate(question)
	}

	const questionTypeQuery = useQuery({
		queryKey: ['question_type'],
		queryFn: QuestionService.getTypeQuestion
	})

	const baremeQuery = useQuery({
		queryKey: ['bareme'],
		queryFn: QuestionService.getBareme
	})

	return {
		status,
		handleCreate,
		questionTypeQuery,
		baremeQuery
	}
}

export {
	useQuestion,
	useCreateQuestion,
	CreateQuestionContext
}