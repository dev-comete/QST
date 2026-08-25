import type { ChangeEvent } from "react";

interface SelectProps {
    id: string;
	name: string;
	label?: string;
    required?: boolean;
    selectionValue: { id: string, value: string | number }[];
    // size?: number;
	value?: string | number;
	handleChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({
	label,
	id,
	name,
    required = false,
    selectionValue,
	value,
    // size = 1,
	handleChange
}: SelectProps) => {

    const styling = "border border-background rounded-md focus:outline focus:outline-primary cursor-pointer";
	const selectId = id || name;

	return (
		<div className="flex flex-col gap-1 w-full text-left relative">
			{label && (
			<label className="text-sm font-medium text-text" htmlFor={selectId}>
				{label}
			</label>
			)}
			<select
				id={selectId}
				name={name}
				required={required}
				value={value}
				className={styling}
				onChange={handleChange}
			>
			{selectionValue.map((selected) => (
				<option key={selected.id} value={selected.value}>
				{selected.value}
				</option>
			))}
			</select>
		</div>
	);
}

export default Select;