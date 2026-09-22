import { useEffect, useState } from "react";
import { getSelectData } from "../../../../other/helper/helper";
import { useBareme } from "../../../../other/hooks/bareme/useBareme";
import Input from "../../../atoms/Form/Input";
import LabelInput from "../../../atoms/Form/LabelInput";
import Select from "../../../atoms/Form/Select";
import ActionButton from "../../../molecules/Buttons/ActionButton";

interface BaremeInputProps {
	onBaremeChange: (value: string) => void;
}

export const OldBaremeInput = ({ onBaremeChange } : BaremeInputProps) => {

	const { baremeQuery, baremeInput, setBaremeInput, handleCreateBareme } = useBareme()
	const { data: baremes } = baremeQuery
		
    useEffect(() => {
        if (baremes && baremes.length > 0) {
            const formatted = getSelectData(baremes, 'pts');
            if (formatted.length > 0) {
                const defaultValue = formatted[0].value ?? formatted[0]; 
                onBaremeChange(defaultValue);
            }
        }
    }, [baremes, onBaremeChange]);

    if (!baremes) return null;

    const baremes_pts = getSelectData(baremes, 'pts');

	return (
		<div className="flex flex-col gap-2">
			<LabelInput label={'Configuration de barème'} />
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

const BaremeInput = ({ onBaremeChange } : BaremeInputProps) => {
	const [value, setValue] = useState<string | number>('1');

	useEffect(() => {
		onBaremeChange(String(value));
	}, []); // call once on mount to set default

	return (
		<Input
			label="Barème"
			id="bareme"
			name='bareme'
			type='number'
			min={0}
			max={100}
			step={0.25}
			onChange={(e) => {
				const v = e.target.value;
				setValue(v);
				onBaremeChange(v);
			}}
			required
			value={value}
		/>
	)
}

export default BaremeInput;