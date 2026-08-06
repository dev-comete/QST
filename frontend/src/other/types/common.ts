type ColorTheme = 'background' | 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'text' | 'white' | 'disabled' | 'transparent';

type NavItem = {
    label: string;
    link: string;
	title?: string
};

type Role = 'admin' | 'formateur' | 'apprenant' | 'rfq'

export interface User {
	id: number,
	role: string,
	username: string,
	first_name: string,
	last_name: string,
	email: string,
	is_staff: boolean,
	is_superuser: boolean,
	orga_principale: null,
	organisations: []
}

export type {
	ColorTheme,
	NavItem,
	Role
}