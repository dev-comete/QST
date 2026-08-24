import type { ColorTheme } from "../../../other/types/common";

interface InputProps {
	label?: string;
	type?: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox' | 'date' | 'datetime-local';
	id: string;
	name: string;
	textColor?: ColorTheme;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	step?: number,
	checked?: boolean,
	className?: string
}

const Input = ({
	label,
	type = 'text',
	id,
	name,
	textColor='text',
	onChange,
	step,
	checked,
	className
}: InputProps) => {

	const basicStyle = "flex p-2 bg-secondary w-full items-center justify-center focus:outline-accent focus:outline-1"

	return (
		<div className="flex flex-col w-full">
			<label htmlFor={name} className={`text-${textColor}`}>{label}</label>
			<input
				type={type}
				id={id}
				name={name}
				className={`${basicStyle} ${className}`}
				onChange={onChange}
				step={step}
				checked={checked}
			/>
		</div>
	)
}

export default Input;