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
	bareme_pts: 0.1,
	options: []
}

const GENERAL_STALE_TIME = 1000 * 60 * 5
const GENERAL_CACHE_TIME = 1000 * 60 * 10

const TOAST_TIMER = 1500

const USERNAME_MIN = 5

export {
	backgroundColor,
	initialQuestion,
	GENERAL_CACHE_TIME,
	GENERAL_STALE_TIME,
	TOAST_TIMER,
	USERNAME_MIN
}