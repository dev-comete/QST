import { getSelectData } from "../../../../other/helper/helper";
import { useBareme } from "../../../../other/hooks/bareme/useBareme";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import CustomText from "../../../atoms/Text/CustomText";
import ActionButton from "../../../molecules/Buttons/ActionButton";

interface BaremeInputProps {
	onBaremeChange: (value: string) => void;
}

const BaremeInput = ({ onBaremeChange } : BaremeInputProps) => {

	const { baremeQuery, baremeInput, setBaremeInput, handleCreateBareme } = useBareme()
	const { data: baremes } = baremeQuery

	if (!baremes) return null
		
	const baremes_pts = getSelectData(baremes, 'pts')

	return (
		<div className="flex flex-col gap-2">
			<CustomText weight="bold">Configuration de barème</CustomText>
			<div className="flex gap-2 items-start w-full">
				<div className="flex gap-1 w-full">
					<Input
						id="bareme"
						name='bareme'
						type='number'
						min={0}
						max={100}
						step={0.25}
						value={baremeInput ?? ''}
						onChange={(e) => { 
							const val = e.target.value;
							setBaremeInput(val === '' ? undefined : Number(val));
						}}
					/>
					<ActionButton
						onClick={handleCreateBareme}
						disabled={baremeInput === undefined}
					>{"+"}</ActionButton>
				</div>
				<Select
					id={"type"}
					name={"type"}
					selectionValue={baremes_pts}
					handleChange={(e: any) => onBaremeChange(e.target.value)}
				/>
			</div>
		</div>

	)
}

export default BaremeInput;