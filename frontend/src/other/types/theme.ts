export type RadiusId = 'sharp' | 'default' | 'round'
export type FontSizeId = 'small' | 'normal' | 'large'

export interface ThemeSettings {
	preset: string          // preset id or 'custom'
	primary: string         // #rrggbb
	fontSize: FontSizeId
	radius: RadiusId
}

export interface ThemePreset {
	id: string
	label: string
	primary: string
}

export const THEME_PRESETS: ThemePreset[] = [
	{ id: 'blue',    label: 'Bleu',     primary: '#0059e9' }, // current default
	{ id: 'emerald', label: 'Émeraude', primary: '#059669' },
	{ id: 'violet',  label: 'Violet',   primary: '#7c3aed' },
	{ id: 'rose',    label: 'Rose',     primary: '#db2777' },
	{ id: 'orange',  label: 'Orange',   primary: '#ea580c' },
	{ id: 'slate',   label: 'Ardoise',  primary: '#334155' },
]

export const FONT_SIZE_PX: Record<FontSizeId, number> = {
	small: 13,
	normal: 14, // matches current base.css
	large: 16,
}

// Overrides Tailwind's --radius-lg / xl / 2xl (used by rounded-lg, rounded-xl, rounded-2xl)
export const RADIUS_SCALE: Record<RadiusId, { lg: string; xl: string; '2xl': string }> = {
	sharp:   { lg: '0.125rem', xl: '0.25rem', '2xl': '0.375rem' },
	default: { lg: '0.5rem',   xl: '0.75rem', '2xl': '1rem' },    // Tailwind defaults
	round:   { lg: '0.75rem',  xl: '1.25rem', '2xl': '1.75rem' },
}

export const DEFAULT_THEME: ThemeSettings = {
	preset: 'blue',
	primary: '#0059e9',
	fontSize: 'normal',
	radius: 'default',
}