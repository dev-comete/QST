import { useState } from "react";
import type { InputProps } from "../../atoms/Form/Input";
import Input from "../../atoms/Form/Input";
import IconButton from "../Buttons/IconButton";

const PasswordInput = ({
	label,
	id,
	name,
	onChange,
	className,
	required,
	value,
	htmlFor,
	placeholder,
}: InputProps)=> {

	const [ show, setShow ] = useState(false)

	return (
		<Input
			label={label}
			type={show ? 'text' : 'password'}
			id={id}
			name={name}
			onChange={onChange}
			className={className}
			required={required}
			value={value}
			htmlFor={htmlFor}
			endIcon={
				<IconButton
					iconName={show ? 'eye-slash' : 'eye'}
					className="!p-0 !bg-transparent !border-0 text-disabled-dark"
					iconStyling="text-base"
					action={() => setShow((prev) => !prev)}
				/>
			}
			placeholder={placeholder}
		/>
	)
}

export default PasswordInput;