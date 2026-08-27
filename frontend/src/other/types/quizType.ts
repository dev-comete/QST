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

type Option = {
	id: number | string;
	reponse: string;
};

type Question = {
	question_id: number | string;
	enonce: string;
	options: Option[];
	type_question?: { code?: string } | string;
};

type QuizInfo = {
	quiz_titre?: string;
	quiz_duree: string | number | null;
	heure_debut: string;
	questions: Question[];
};

type AnswersMap = Record<string, Array<number | string>>;

export type {
	quizType,
	quizCreateType,
	quizAssignPayload,
	studentQuizType,
	QuizInfo,
	AnswersMap,
	Question,
	Option
}