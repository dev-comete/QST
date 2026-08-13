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

type quizCreateType = Pick<quizType, 'duree' | 'formation' | 'status' >

export type {
	quizType,
	quizCreateType
}