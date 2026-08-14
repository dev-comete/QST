type respType = {
	reponse: string,
	est_correct: boolean,
	explication: string
}

type questionIdType  = {
	id : number,
	type_question: string,
	code : string
}

type baremeType = {
	id: number,
	pts: number
}

type questionType = {
	enonce_question: string,
	type_id: number,
	bareme_pts: number,
	options: respType[]
}

type bankQuestionType = {
	id: number,
	enonce_question: string,
	reponses: {
		id: number,
		texte: string,
		est_correcte: boolean,
		explication: string
	}[]
}

type assignQuestionType = {
	id: number,
	texte_enonce: string,
	type_id: string,
	bareme_pts: number
}

export type {
	questionType,
	respType,
	questionIdType,
	baremeType,
	bankQuestionType,
	assignQuestionType
}