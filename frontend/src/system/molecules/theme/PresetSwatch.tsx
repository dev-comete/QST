import CustomText from '../../atoms/Text/CustomText'

interface PresetSwatchProps {
	label: string
	color: string
	selected: boolean
	onClick: () => void
}

const PresetSwatch = ({ label, color, selected, onClick }: PresetSwatchProps) => (
	<button
		type="button"
		onClick={onClick}
		title={label}
		aria-pressed={selected}
		className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
			selected ? 'border-primary shadow-sm' : 'border-background hover:border-disabled'
		}`}
	>
		<span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: color }} />
		<CustomText textTag="h6" weight={selected ? 'bold' : 'normal'}>{label}</CustomText>
	</button>
)

export default PresetSwatch