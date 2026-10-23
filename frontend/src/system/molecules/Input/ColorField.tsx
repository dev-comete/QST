import { useState } from 'react'
import ColorInput from '../../atoms/Form/ColorInput'
import Input from '../../atoms/Form/Input'
import LabelInput from '../../atoms/Form/LabelInput'
import Box from '../../atoms/Container/Box'
import { isValidHex } from '../../../other/helper/themeHelper'

interface ColorFieldProps {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
}

const ColorField = ({ id, label, value, onChange }: ColorFieldProps) => {
	const [draft, setDraft] = useState(value)
	const [prevValue, setPrevValue] = useState(value)

	// Keep the text field in sync when the value changes from outside (picker / preset / reset)
	if (value !== prevValue) {
		setPrevValue(value)
		setDraft(value)
	}

	const handleText = (raw: string) => {
		const next = raw.startsWith('#') ? raw : `#${raw}`
		setDraft(next)
		if (isValidHex(next)) onChange(next.toLowerCase())
	}

	return (
		<Box direction="column" className="gap-1">
			<LabelInput label={label} htmlFor={id} />
			<Box className="items-center">
				<ColorInput id={id} name={id} value={value} onChange={onChange} />
				<Input
					id={`${id}_hex`}
					name={`${id}_hex`}
					value={draft}
					maxLength={7}
					onChange={(e) => handleText(e.target.value)}
					className="font-mono uppercase"
				/>
			</Box>
		</Box>
	)
}

export default ColorField