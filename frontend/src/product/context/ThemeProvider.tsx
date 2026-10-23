import { useLayoutEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from '../../other/hooks/theme/useTheme'
import { useAuth } from '../../other/hooks/auth/useAuth'
import { ThemeStorage } from '../../other/services/themeStorage'
import { applyTheme } from '../../other/helper/themeHelper'
import { DEFAULT_THEME, THEME_PRESETS, type ThemeSettings } from '../../other/types/theme'

const ThemeProviderInner = ({ userId, children }: { userId: number | null, children: ReactNode }) => {
	const [theme, setTheme] = useState<ThemeSettings>(() => ThemeStorage.load(userId))

	// Layout effect: applied before paint, so no flash of the default theme
	useLayoutEffect(() => {
		applyTheme(theme)
	}, [theme])

	const commit = (next: ThemeSettings) => {
		setTheme(next)
		ThemeStorage.save(next, userId)
	}

	const updateTheme = (patch: Partial<ThemeSettings>) => {
		// Editing the color by hand leaves the preset
		const preset = patch.primary && !patch.preset ? 'custom' : (patch.preset ?? theme.preset)
		commit({ ...theme, ...patch, preset })
	}

	const selectPreset = (presetId: string) => {
		const preset = THEME_PRESETS.find((p) => p.id === presetId)
		if (preset) commit({ ...theme, preset: preset.id, primary: preset.primary })
	}

	const resetTheme = () => {
		ThemeStorage.clear(userId)
		setTheme(DEFAULT_THEME)
	}

	return (
		<ThemeContext.Provider value={{ theme, updateTheme, selectPreset, resetTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

// key={userId}: login / logout remounts the inner provider, which reloads that user's theme
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const { authUser } = useAuth()
	const userId = authUser?.id ?? null
	return <ThemeProviderInner key={userId ?? 'guest'} userId={userId}>{children}</ThemeProviderInner>
}