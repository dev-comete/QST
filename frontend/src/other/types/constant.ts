import type { ColorTheme } from "./common";
import type { questionType } from "./questionType";

const backgroundColor : Record<ColorTheme, string> = {
		// Background
		'background-light': 'bg-background-light',
		'background': 'bg-background',
		'background-dark': 'bg-background-dark',
		
		// Primary
		'primary-light': 'bg-primary-light',
		'primary': 'bg-primary',
		'primary-dark': 'bg-primary-dark',
		
		// Secondary
		'secondary-light': 'bg-secondary-light',
		'secondary': 'bg-secondary',
		'secondary-dark': 'bg-secondary-dark',
		
		// Accent
		'accent-light': 'bg-accent-light',
		'accent': 'bg-accent',
		'accent-dark': 'bg-accent-dark',
		
		// Text
		'text-light': 'bg-text-light',
		'text': 'bg-text',
		'text-dark': 'bg-text-dark',
		
		// Success
		'success-light': 'bg-success-light',
		'success': 'bg-success',
		'success-dark': 'bg-success-dark',
		
		// Error
		'error-light': 'bg-error-light',
		'error': 'bg-error',
		'error-dark': 'bg-error-dark',
		
		// Warning
		'warning-light': 'bg-warning-light',
		'warning': 'bg-warning',
		'warning-dark': 'bg-warning-dark',
		
		// Disabled
		'disabled-light': 'bg-disabled-light',
		'disabled': 'bg-disabled',
		'disabled-dark': 'bg-disabled-dark',

		'white': 'bg-white',
		'transparent' : 'bg-transparent'
}


const initialQuestion : questionType = {
	enonce_question: "",
	type_id: 0,
	bareme_pts: 1,
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