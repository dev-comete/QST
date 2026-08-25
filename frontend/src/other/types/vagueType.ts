
type etudiantType = {
	etudiant_id: number,
	username: string,
	email: string
}

type vagueType = {
	id: number,
	formation_nom: string,
	debut: string | null,
	fin: string | null,
	etudiants: etudiantType[]
}

type vaguePayload = {
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

export type {
	vagueType,
	vaguePayload,
	etudiantType,
	assignStudentPayload,
	assignQuizPayload
}