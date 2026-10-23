import { FONT_SIZE_PX, RADIUS_SCALE, type ThemeSettings } from '../types/theme'

export const isValidHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

const mix = (color: string, percent: number, other: 'white' | 'black') =>
	`color-mix(in srgb, ${color} ${percent}%, ${other})`

export const buildThemeVars = ({ primary, fontSize, radius }: ThemeSettings): Record<string, string> => ({
	'--color-primary': primary,
	'--color-primary-light': mix(primary, 80, 'white'),
	'--color-primary-dark': mix(primary, 80, 'black'),
	'--color-secondary': mix(primary, 6, 'white'),
	'--color-secondary-light': mix(primary, 3, 'white'),
	'--color-secondary-dark': mix(primary, 14, 'white'),
	'--color-accent': mix(primary, 16, 'white'),
	'--color-accent-light': mix(primary, 8, 'white'),
	'--color-accent-dark': mix(primary, 45, 'white'),
	'--radius-lg': RADIUS_SCALE[radius].lg,
	'--radius-xl': RADIUS_SCALE[radius].xl,
	'--radius-2xl': RADIUS_SCALE[radius]['2xl'],
	'--app-font-size': `${FONT_SIZE_PX[fontSize]}px`,
})

export const applyTheme = (settings: ThemeSettings, root: HTMLElement = document.documentElement) => {
	Object.entries(buildThemeVars(settings)).forEach(([key, value]) => root.style.setProperty(key, value))
}

// WCAG contrast of white text over the chosen color (buttons use text-white on bg-primary)
const channel = (v: number) => {
	const c = v / 255
	return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export const getContrastWithWhite = (hex: string): number => {
	if (!isValidHex(hex)) return 21
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
	return 1.05 / (luminance + 0.05)
}