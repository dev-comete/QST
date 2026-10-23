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

type QuestionTypePayload = {
	type_question: string
	code: string
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

type bankQuestionResp = {
	id: number,
	texte: string,
	est_correct: boolean,
	explication: string
}

type bankQuestionType = {
	id: number,
	enonce_question: string,
	reponses: bankQuestionResp[]
}

type importWarning =
	| 'no_correct_answer'
	| 'too_few_options'
	| 'all_options_correct'
	| 'unknown_type'

// One question as returned by the AI import preview
type importedQuestionType = {
	enonce_question: string,
	type_code: string,
	type_id: number | null,
	bareme_pts: number,
	options: respType[],
	warnings: importWarning[]
}

type importQuestionsResponse = {
	message: string,
	count: number,
	skipped: number,
	questions: importedQuestionType[]
}

type importQuestionsPayload = {
	fichier?: File | null,
	texte?: string
}

// Editable copy of an imported question, living in the preview screen
type importDraftType = {
	uid: string,
	selected: boolean,
	enonce_question: string,
	bareme_pts: number,
	options: respType[],
	saveError?: string
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
	QuestionTypePayload,
	baremeType,
	bankQuestionType,
	assignQuestionType,
	bankQuestionResp,
	importWarning,
	importedQuestionType,
	importQuestionsResponse,
	importQuestionsPayload,
	importDraftType,
}