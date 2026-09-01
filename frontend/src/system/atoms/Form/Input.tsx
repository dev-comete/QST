import type { ColorTheme } from "../../../other/types/common";

interface InputProps {
	label?: string;
	type?: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox' | 'date' | 'datetime-local' | 'radio';
	id: string;
	name: string;
	textColor?: ColorTheme;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	step?: number,
	checked?: boolean,
	className?: string
	readOnly?: boolean
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
	className,
	readOnly
}: InputProps) => {

	const basicStyle = "flex p-2 rounded-xl border border-background bg-white w-full items-center justify-center focus:outline focus:outline-primary"

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
				autoComplete={type}
				readOnly={readOnly}
			/>
		</div>
	)
}

export default Input;