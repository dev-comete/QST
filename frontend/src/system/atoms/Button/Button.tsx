import type React from "react";
import { backgroundColor } from "../../../other/types/constant";

interface ButtonProps {
	children?: React.ReactNode;
	color?: string;
	customStyling?: string;
	action : () => void;
}

const Button = ({ children, color, customStyling, action }: ButtonProps) => {
	return (
		<button 
			className={`${backgroundColor[color]} ${customStyling} px-5 py-4 rounded-sm`}
			onClick={action}
		>
			{children}
		</button>
	);
}

export default Button; 