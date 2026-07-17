import type { ColorTheme } from "./common";

const backgroundColor : Record<ColorTheme, string> = {
	'background': 'bg-background',
	'primary': 'bg-primary',
	'secondary': 'bg-secondary',
	'accent': 'bg-accent',
	'success': 'bg-success',
	'error': 'bg-error',
	'warning': 'bg-warning',
	'text': 'bg-text',
	'white': 'bg-white',
	'disabled' : 'bg-disabled'
}

export {
	backgroundColor
}