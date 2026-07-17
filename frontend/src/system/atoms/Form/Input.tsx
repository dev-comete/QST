interface InputProps {
	label: string;
	type: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox';
	id: string;
	name: string;
}

const Input = ({
	label,
	type,
	id,
	name
}: InputProps) => {
	return (
		<div className="flex flex-col">
			<label htmlFor={name} className="text-text">{label}</label>
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