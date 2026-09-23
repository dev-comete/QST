type FormationPayload = {
	nom_formation: string,
}

type Formation = {
	id: number,
	nom_formation: string,
	createur: number,
	organisation: string | number | null
}

export type {
	FormationPayload,
	Formation
}