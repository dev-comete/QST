type BulletinVague = {
	vague_id: number,
	formation_nom: string,
	debut: string,
	fin: string
}

type DetailQuiz = {
	quiz_id: number,
	statut: string,
	score_obtenu: number,
	score_maximum: number,
	pourcentage: number
}

type BulletinGlobal = {
    apprenant: {
		id: number,
		nom: string,
		prenom: string,
		username: string
	},
    vague: {
        id: number,
        formation: string
    },
    resume_global: {
        total_score_obtenu: number,
        total_score_possible: number,
        moyenne_generale_pct: number,
        progression: string
    },
    details_quizzes: DetailQuiz[]
}

export type {
	BulletinVague,
	BulletinGlobal,
	DetailQuiz
}