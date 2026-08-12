import { type UseQueryResult } from "@tanstack/react-query";
import type { questionType } from "../types/questionType";
import { createContext, useContext, type Dispatch, type SetStateAction } from "react";


interface CreateQuestionContextType {
	question: questionType,
	setQuestion: Dispatch<SetStateAction<questionType>>;
	handleCreate: (e: React.SubmitEvent<HTMLFormElement>) => void
	baremeQuery: UseQueryResult<any, Error>
	questionTypeQuery: UseQueryResult<any, Error>
}

const CreateQuestionContext = createContext<CreateQuestionContextType | undefined>(undefined);

export const useCreateQuestion = () => {
	const context = useContext(CreateQuestionContext);
	if (!context) throw new Error('useCreateQuestion must be used within an AuthProvider');
	return context;
}