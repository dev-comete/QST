interface ColorInputProps {
	id: string
	name: string
	value: string
	onChange: (value: string) => void
	className?: string
}

const ColorInput = ({ id, name, value, onChange, className = '' }: ColorInputProps) => (
	<input
		type="color"
		id={id}
		name={name}
		value={value}
		onChange={(e) => onChange(e.target.value)}
		className={`h-10 w-12 cursor-pointer rounded-xl border border-background bg-white p-1 ${className}`}
	/>
)

export default ColorInput