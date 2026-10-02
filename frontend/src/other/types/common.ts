
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
    | 'background-light'
    | 'background' 
    | 'background-dark'
    | 'primary-light'
    | 'primary' 
    | 'primary-dark'
    | 'secondary-light'
    | 'secondary' 
    | 'secondary-dark'
    | 'accent-light'
    | 'accent' 
    | 'accent-dark'
    | 'text-light'
    | 'text' 
    | 'text-dark'
    | 'success-light' 
    | 'success' 
    | 'success-dark' 
    | 'error-light' 
    | 'error' 
    | 'error-dark' 
    | 'warning-light' 
    | 'warning' 
    | 'warning-dark' 
    | 'disabled-light'
    | 'disabled'
    | 'disabled-dark'
    | 'white' 
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