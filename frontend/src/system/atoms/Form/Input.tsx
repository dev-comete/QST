import type { ColorTheme } from "../../../other/types/common";

interface InputProps {
	label?: string;
	type?: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox';
	id: string;
	name: string;
	textColor?: ColorTheme;
}

const Input = ({
	label,
	type = 'text',
	id,
	name,
	textColor='text'
}: InputProps) => {
	return (
		<div className="flex flex-col">
			<label htmlFor={name} className={`text-${textColor}`}>{label}</label>
			<input
				type={type}
				id={id}
				name={name}
				className="bg-white w-fit focus:outline-accent focus:outline-1"
			/>
		</div>
	)
}

export default Input;