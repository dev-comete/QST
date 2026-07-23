type ColorTheme = 'background' | 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'text' | 'white' | 'disabled';

type NavItem = {
    label: string;
    link: string;
};

export type {
	ColorTheme,
	NavItem
}