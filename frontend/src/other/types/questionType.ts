type respType = {
	reponse: string,
	est_correct: boolean,
	explication?: string
}

type questionType = {
	enonce_question: string,
	type_id: number,
	bareme_pts: number,
	options: respType[]
}

export type {
	questionType,
	respType
}