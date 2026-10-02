import type { ChangeEvent } from "react";
import LabelInput from "./LabelInput";

interface SelectProps {
    id: string;
	name: string;
	label?: string;
    required?: boolean;
    selectionValue: { id: string, value: string | number }[];
    className?: string;
    // size?: number;
	value?: string | number;
	placeholder?: string
	handleChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({
	label,
	id,
	name,
    required = false,
    selectionValue,
	className,
	value,
	placeholder,
    // size = 1,
	handleChange
}: SelectProps) => {

	const styling = "w-full h-10 px-3 py-2 text-base text-text bg-white border border-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ";
	const selectId = id || name;
	const wrapperClassName = ["flex flex-col gap-1 w-full text-left", className].filter(Boolean).join(" ");

	return (
		<div className={wrapperClassName}>
			{ label && <LabelInput label={label} htmlFor={selectId}/> }
			<select
				id={selectId}
				name={name}
				required={required}
				{...(value !== undefined ? { value } : { defaultValue: "" })}
				className={styling}
				onChange={handleChange}
			>
				{placeholder && (
					<option value="">
					{placeholder}
					</option>
				)}
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
