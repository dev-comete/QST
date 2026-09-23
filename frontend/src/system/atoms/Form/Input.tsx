import type { ReactNode } from "react";
import type { ColorTheme } from "../../../other/types/common";
import LabelInput from "./LabelInput";

interface InputProps {
	label?: string;
	type?: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox' | 'date' | 'datetime-local' | 'radio' | 'number';
	id: string;
	name: string;
	textColor?: ColorTheme;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	step?: number,
	checked?: boolean,
	className?: string
	readOnly?: boolean
	min?: string | number
	max?: string | number
	required?: boolean
	value?: string | number
	htmlFor?: string
	endIcon?: ReactNode
}

const Input = ({
	label,
	type = 'text',
	id,
	name,
	onChange,
	step,
	checked,
	className,
	readOnly,
	min,
	max,
	required,
	value,
	htmlFor,
	endIcon,
}: InputProps) => {

	const basicStyle = `flex p-2 rounded-xl ${type != 'checkbox' && 'border'} border-background w-full items-center justify-center focus:outline focus:outline-primary`

	return (
		<div className="flex flex-col w-full relative">
			{ label && <LabelInput label={label} htmlFor={htmlFor} required={required}/> }
			<input
				type={type}
				id={id}
				name={name}
				className={`w-full bg-white pr-12 [&::-webkit-search-cancel-button]:appearance-none ${basicStyle} ${className}`}
				onChange={onChange}
				step={step}
				checked={checked}
				autoComplete={type}
				readOnly={readOnly}
				min={min}
				max={max}
				required={required}
				value={value}
			/>
			{endIcon && (
				<div className="absolute right-1 top-1 flex items-center justify-center">
					{endIcon}
				</div>
			)}
		</div>
	)
}

export default Input;