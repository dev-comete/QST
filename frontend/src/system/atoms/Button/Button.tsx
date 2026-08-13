import type React from "react";
import { backgroundColor } from "../../../other/types/constant";
import type { ColorTheme } from "../../../other/types/common";

interface ButtonProps {
	children?: React.ReactNode;
	color?: ColorTheme;
	className?: string;
	paddingX?: number;
	paddingY?: number;
	isRounded?: boolean;
	disabled?: boolean;
	action? : (event: React.MouseEvent<HTMLButtonElement>) => void;
	type?: 'submit' | 'reset' | 'button';
	form?: string
}

const Button = ({
	children,
	color = 'white',
	isRounded = true,
	className,
	disabled = false,
	type,
	form,
	action 
}: ButtonProps) => {

	const roundParam = isRounded ? "rounded-sm" : ""
	const isDisable = disabled ? "disabled:pointer-events-none" : ""

	return (
		<button 
			className={`${backgroundColor[color]} ${className} px-3 py-2 ${roundParam} w-fit ${isDisable}`}
			disabled={disabled}
			onClick={action}
			type={type}
			form={form}
		>
			{children}
		</button>
	);
}

export default Button; 