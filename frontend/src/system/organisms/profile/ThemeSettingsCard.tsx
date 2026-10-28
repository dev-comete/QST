import Box from '../../atoms/Container/Box'
import Paper from '../../atoms/Container/Paper'
import CustomText from '../../atoms/Text/CustomText'
import Info from '../../atoms/Form/Info'
import Button from '../../atoms/Button/Button'
import ColorField from '../../molecules/Input/ColorField'
import SegmentedControl from '../../molecules/Input/SegmentedControl'
import PresetSwatch from '../../molecules/theme/PresetSwatch'
import { useTheme } from '../../../other/hooks/theme/useTheme'
import { getContrastWithWhite } from '../../../other/helper/themeHelper'
import { THEME_PRESETS, type FontSizeId, type RadiusId } from '../../../other/types/theme'
import IconButton from '../../molecules/Buttons/IconButton'

const FONT_OPTIONS: { id: FontSizeId; label: string }[] = [
	{ id: 'small', label: 'Petit' },
	{ id: 'normal', label: 'Normal' },
	{ id: 'large', label: 'Grand' },
]

const RADIUS_OPTIONS: { id: RadiusId; label: string }[] = [
	{ id: 'sharp', label: 'Angulaire' },
	{ id: 'default', label: 'Standard' },
	{ id: 'round', label: 'Arrondi' },
]

const ThemeSettingsCard = () => {
	const { theme, updateTheme, selectPreset, resetTheme } = useTheme()
	const lowContrast = getContrastWithWhite(theme.primary) < 4.5

	return (
		<Paper className="w-full p-6">
			<Box direction="column" className="w-full gap-3">
				<Box className="items-start justify-between flex-wrap gap-2">
					<CustomText textTag="h5" color="disabled">
						Personnalisez les couleurs et l'affichage. Ces préférences sont enregistrées sur cet appareil.
					</CustomText>
					<div className='border border-background rounded-xl hover:bg-disabled-light'>
						<IconButton iconName='rotate' title='Réinitialiser' className='border p-2 border-background' action={resetTheme}/>
					</div>
				</Box>

				<Box direction="column" className="gap-2">
					<CustomText weight="bold">Thème de couleur</CustomText>
					<Box className="flex-wrap">
						{THEME_PRESETS.map((preset) => (
							<PresetSwatch
								key={preset.id}
								label={preset.label}
								color={preset.primary}
								selected={theme.preset === preset.id}
								onClick={() => selectPreset(preset.id)}
							/>
						))}
					</Box>
				</Box>

				<div className="w-full max-w-xs">
					<ColorField
						id="theme_primary"
						label="Couleur personnalisée"
						value={theme.primary}
						onChange={(primary) => updateTheme({ primary })}
					/>
				</div>
				{lowContrast && (
					<Info
						variant="alert"
						info="Cette couleur est trop claire : le texte blanc des boutons sera difficile à lire."
					/>
				)}

				<SegmentedControl
					label="Taille du texte"
					value={theme.fontSize}
					options={FONT_OPTIONS}
					onChange={(fontSize) => updateTheme({ fontSize })}
				/>
				<SegmentedControl
					label="Style des coins"
					value={theme.radius}
					options={RADIUS_OPTIONS}
					onChange={(radius) => updateTheme({ radius })}
				/>
			</Box>
		</Paper>
	)
}

export default ThemeSettingsCard