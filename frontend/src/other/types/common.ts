
	/* Interface */

export interface User {
	id: number,
	role: Role,
	username: string,
	first_name: string,
	last_name: string,
	email: string,
	is_staff: boolean,
	is_superuser: boolean,
	orga_principale: null,
	organisations: []
}

export interface ModalsProps {
	open: boolean;
	closeModal: () => void
}

	/* Type */

type authData = {
	access: string,
	refresh: string,
	user: User
}

type formationType = {
	id: number,
	nom_formation: string,
	createur: number,
	organisation: string | null	
}

type ColorTheme = 
	'background' 
	| 'primary' 
	| 'secondary' 
	| 'accent' 
	| 'success' 
	| 'success-light' 
	| 'success-dark' 
	| 'error' 
	| 'error-light' 
	| 'error-dark' 
	| 'warning' 
	| 'warning-light' 
	| 'warning-dark' 
	| 'text' 
	| 'white' 
	| 'disabled' 
	| 'transparent';

type Role = 'admin' | 'formateur' | 'apprenant' | 'rfq'

interface PaginatedData<T> {
	count: number
	next: string | null
	prev: string | null
	results: T[]
}

export type {
	ColorTheme,
	Role,
	authData,
	formationType,
	PaginatedData
}