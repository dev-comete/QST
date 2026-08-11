import { useState, type ReactNode } from "react"
import { CreateQuestionContext } from "../../other/hooks/useQuestion"
import { initialQuestion } from "../../other/types/constant"
import type { questionType } from "../../other/types/questionType"

export const CreationQuestionProvider = ({ children }: { children: ReactNode }) => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)

	return (
		<CreateQuestionContext.Provider value={{ question, setQuestion }}>
			{children}
		</CreateQuestionContext.Provider>
	)
}