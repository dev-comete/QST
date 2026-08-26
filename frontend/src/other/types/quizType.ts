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

type studentQuizType = {
	quiz_id: number,
	quiz_titre: string,
	formation_nom: string,
	termine: boolean,
	score_obtenu: number
}

export type {
	quizType,
	quizCreateType,
	quizAssignPayload,
	studentQuizType
}