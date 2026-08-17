type quizType = {
	id: number,
	date_creation_quiz: string,
	duree: string,
	status: string,
	date_ouverture: string | null,
	date_fermeture: string | null,
	is_active: boolean,
	formation: string
}

type quizSelectedQuestion = {
	question_id: number,
	bareme_pts: number
}

type quizAssignPayload = {
	quiz_id: number,
	questions_choisies: quizSelectedQuestion[]
}

type quizCreateType = Pick<quizType, 'duree' | 'formation' | 'status' >

export type {
	quizType,
	quizCreateType,
	quizAssignPayload
}