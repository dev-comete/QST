import { useState } from "react"
import type { assignQuestionType } from "../../types/questionType"

const useAssignQuiz = () => {

	const [ selectedQuestion, setSelectedQuestion ] = useState<assignQuestionType[]>([])

	const handleAssignQuestion = () => {

	}


	return {
		selectedQuestion,
		setSelectedQuestion,
		handleAssignQuestion
	}
}

export default useAssignQuiz