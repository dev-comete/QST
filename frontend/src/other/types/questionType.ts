type respType = {
	reponse: string,
	est_correct: boolean,
	explication?: string
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

export type {
	questionType,
	respType,
	questionIdType,
	baremeType
}