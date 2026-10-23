import { createContext, useContext } from 'react'
import type { ThemeSettings } from '../../types/theme'

interface ThemeContextType {
	theme: ThemeSettings
	updateTheme: (patch: Partial<ThemeSettings>) => void
	selectPreset: (presetId: string) => void
	resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function useTheme() {
	const context = useContext(ThemeContext)
	if (!context) throw new Error('useTheme must be used within a ThemeProvider')
	return context
}

export { ThemeContext, useTheme }
export type { ThemeContextType }