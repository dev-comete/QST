
type etudiantType = {
	etudiant_id: number,
	username: string,
	email: string
}

type vagueQuiz = {
	id: number,
	titre: string,
	status: string
}

type vagueType = {
	id: number,
	formation_nom: string,
	debut: string | null,
	fin: string | null,
	etudiants: etudiantType[]
	quiz_assignes_ids: number[]
	quizzes_assignes: vagueQuiz[]
}

type vaguePayload = {
	nom_vague: string,
	formation_id: string,
	debut: string | null,
	fin: string | null
}

type assignStudentPayload = {
	vague_id: number,
	etudiant_ids: number[]
}

type assignQuizPayload = {
	vague_id: number,
	quiz_id: number
}

type vagueStatInfo = {
	id: number,
	vague_nom: string,
	formation: string,
	total_inscrits: number
}

type vagueStatGlobal = {
	points_totaux_possibles: number,
	moyenne_globale_classe: number,
	taux_reussite_global_pct: number,
	majors_de_promo_top3: string[],
	etudiants_en_difficulte_bottom3: string[]
}

type vagueStatQuiz = {
	quiz_id: number,
	quiz_titre: string,
	status: string,
	points_maximum: number,
	taux_participation_pct: number,
	moyenne_classe: number,
	taux_reussite_pct: number,
	top_3: string[],
	bottom_3: string[],
	alerte_question_difficile: string | null,
	nombre_echecs_question: number
}

type vagueStat = {
	vague: vagueStatInfo,
    statistiques_globales: vagueStatGlobal,
    statistiques_par_quiz: vagueStatQuiz[]
}

export type {
	vagueType,
	vaguePayload,
	vagueQuiz,
	etudiantType,
	assignStudentPayload,
	assignQuizPayload,
	vagueStat,
	vagueStatGlobal,
	vagueStatInfo,
	vagueStatQuiz
}