type ColorTheme = 'background' | 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'text' | 'white' | 'disabled' | 'transparent';

type NavItem = {
    label: string;
    link: string;
	title: string
};

export type {
	ColorTheme,
	NavItem
}