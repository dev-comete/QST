type responseType = {
	reponse: string,
	est_correcte: boolean
}

type questionType = {
	enonce_question: string,
	type_id: number,
	bareme_id: number,
	options: responseType[]
}

export type {
	questionType,
	responseType
}