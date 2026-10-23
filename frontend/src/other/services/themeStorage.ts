import { DEFAULT_THEME, type ThemeSettings } from '../types/theme'

const keyFor = (userId?: number | null) => `qst_theme_${userId ?? 'guest'}`

export const ThemeStorage = {
	load: (userId?: number | null): ThemeSettings => {
		try {
			const raw = localStorage.getItem(keyFor(userId))
			return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : DEFAULT_THEME
		} catch {
			return DEFAULT_THEME
		}
	},

	save: (settings: ThemeSettings, userId?: number | null) => {
		localStorage.setItem(keyFor(userId), JSON.stringify(settings))
	},

	clear: (userId?: number | null) => localStorage.removeItem(keyFor(userId)),
}