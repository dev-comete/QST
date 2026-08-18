type userType = {
	id: number,
	username: string,
	email: string,
	type_utilisateur: number | null,
	organisation: string[]
}

type userPayload = Omit<userType, 'id'>

type utilisateurType = {
	id: number,
	type_utilisateur: string
}

type organisationType = {
	id: number,
	nom: string,
	date_creation: string,
	is_active: boolean
}

export type {
	userType,
	userPayload,
	utilisateurType,
	organisationType
}