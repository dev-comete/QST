import type React from "react";
import { backgroundColor } from "../../../other/types/constant";
import type { ColorTheme } from "../../../other/types/common";

interface ButtonProps {
	children?: React.ReactNode;
	color?: ColorTheme;
	customStyling?: string;
	paddingX?: number;
	paddingY?: number;
	isRounded?: boolean;
	disabled?: boolean;
	action? : () => void;
	type?: 'submit' | 'reset' | 'button';
}

const Button = ({
	children,
	color = 'white',
	isRounded = true,
	customStyling,
	disabled = false,
	type,
	action 
}: ButtonProps) => {

	const roundParam = isRounded ? "rounded-sm" : ""
	const isDisable = disabled ? "disabled:pointer-events-none" : ""

	return (
		<button 
			className={`${backgroundColor[color]} ${customStyling} px-3 py-2 ${roundParam} w-fit ${isDisable}`}
			disabled={disabled}
			onClick={action}
			type={type}
		>
			{children}
		</button>
	);
}

export default Button; 