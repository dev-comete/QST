import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../services/questionService";
import type { questionType } from "../types/questionType";

const useQuestion = (data : questionType) => {

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
		mutate(data)
	}

	return {
		status,
		handleCreate
	}
}

export {
	useQuestion
}