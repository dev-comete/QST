import { type UseQueryResult } from "@tanstack/react-query";
import type { baremeType, questionIdType, questionType } from "../../types/questionType";
import { createContext, useContext, type Dispatch, type SetStateAction } from "react";

interface QuestionCreateContextType {
	question: questionType,
	setQuestion: Dispatch<SetStateAction<questionType>>;
	handleCreate: (e: React.SubmitEvent<HTMLFormElement>) => void
	baremeQuery: UseQueryResult<baremeType[], Error>
	questionTypeQuery: UseQueryResult<questionIdType[], Error>
}

export const QuestionCreateContext = createContext<QuestionCreateContextType | undefined>(undefined);

export const useQuestionCreate = () => {
	const context = useContext(QuestionCreateContext);
	if (!context) throw new Error('useCreateQuestion must be used within an AuthProvider');
	return context;
}