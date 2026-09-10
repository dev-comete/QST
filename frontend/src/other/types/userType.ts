type userType = {
	id: number,
	username: string,
	email: string,
	type_utilisateur: number | null,
	projets: number[]
}

type userPayload = Omit<userType, 'id'>

type utilisateurType = {
	id: number,
	type_utilisateur: string
}

type projectType = {
	id: number,
	nom: string,
	date_creation: string,
	is_active: boolean
}

type ProjectPayload = {
	nom: string,
	is_active: boolean
}

export type {
	userType,
	userPayload,
	utilisateurType,
	projectType,
	ProjectPayload
}