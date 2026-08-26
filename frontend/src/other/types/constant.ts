import type { ColorTheme, NavItem } from "./common";
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

export interface SideBarConfig {
	navItem: NavItem
}

// export const ROLE_CONFIGS: Record<string, SideBarConfig> = {
// 	admin: {
// 		navItem: 
// 	}
// }

export {
	backgroundColor,
	initialQuestion,
	GENERAL_CACHE_TIME,
	GENERAL_STALE_TIME
}