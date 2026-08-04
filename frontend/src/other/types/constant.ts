import type { ColorTheme } from "./common";
import type { questionType } from "./questionType";

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
	'disabled' : 'bg-disabled',
	'transparent' : 'bg-transparent'
}

const initialQuestion : questionType = {
	enonce_question: "",
	type_id: 0,
	bareme_id: 0,
	options: []
}

export {
	backgroundColor,
	initialQuestion
}