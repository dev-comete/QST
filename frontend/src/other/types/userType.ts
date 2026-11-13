type userType = {
	id: number,
	username: string,
	email: string,
	type_utilisateur: number | null,
	projets: number[],
	is_active: boolean
}

type userPayload = Omit<userType, 'id' | 'is_active'>

type userWithOrganisation = {
	id: number,
	username: string,
	email: string,
	type_utilisateur: number | null,
	organisation: number[]
}

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

type UserTypePayload = {
	type_utilisateur: string
}

export type {
	userType,
	userPayload,
	utilisateurType,
	projectType,
	ProjectPayload,
	userWithOrganisation,
	UserTypePayload,
}