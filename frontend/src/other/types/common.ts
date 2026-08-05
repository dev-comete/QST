type ColorTheme = 'background' | 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'text' | 'white' | 'disabled' | 'transparent';

type NavItem = {
    label: string;
    link: string;
	title?: string
};

type Role = 'admin' | 'formateur' | 'apprenant' | 'rfq'

export type {
	ColorTheme,
	NavItem,
	Role
}