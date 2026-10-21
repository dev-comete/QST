import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText"

interface ToggleChipProps {
	label: string
	selected: boolean
	accent?: string
	onClick: () => void
}

const ToggleChip = ({
	label,
	selected,
	accent = "#0059e9",
	onClick,
}: ToggleChipProps) => {
	return (
		<Button
			color={selected ? "secondary" : "white"}
			onClick={onClick}
			className={`!px-3 !py-1.5 border ${selected ? "border-primary shadow-sm" : "border-background"}`}
			title={selected ? `Retirer ${label}` : `Comparer ${label}`}
		>
			<span className="flex items-center gap-2">
				<span
					className="w-2 h-2 rounded-full shrink-0"
					style={{ backgroundColor: accent }}
				/>
				<CustomText
					textTag="h6"
					weight={selected ? "bold" : "normal"}
					className="whitespace-nowrap"
				>
					{label}
				</CustomText>
			</span>
		</Button>
	)
}

export default ToggleChip
