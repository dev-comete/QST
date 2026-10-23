import Box from '../../atoms/Container/Box'
import Button from '../../atoms/Button/Button'
import CustomText from '../../atoms/Text/CustomText'
import LabelInput from '../../atoms/Form/LabelInput'

interface SegmentedControlProps<T extends string> {
	label: string
	value: T
	options: { id: T; label: string }[]
	onChange: (value: T) => void
}

const SegmentedControl = <T extends string,>({ label, value, options, onChange }: SegmentedControlProps<T>) => (
	<Box direction="column" className="gap-1">
		<LabelInput label={label} />
		<Box>
			{options.map((option) => {
				const selected = option.id === value
				return (
					<Button
						key={option.id}
						color={selected ? 'primary' : 'white'}
						onClick={() => onChange(option.id)}
						className={`border ${selected ? 'border-primary' : 'border-background'}`}
					>
						<CustomText color={selected ? 'white' : 'text'} weight={selected ? 'bold' : 'normal'}>
							{option.label}
						</CustomText>
					</Button>
				)
			})}
		</Box>
	</Box>
)

export default SegmentedControl