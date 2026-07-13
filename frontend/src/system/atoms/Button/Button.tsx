import type React from "react";
import type { ColorTheme } from "../../../other/types/common";

interface ButtonProps {
	children?: React.ReactNode;
	color?: string;
	customStyling?: string;
	action : () => void;
}

const btnColor : Record<ColorTheme, string> = {
	'background': 'bg-background',
	'primary': 'bg-primary',
	'secondary': 'bg-secondary',
	'accent': 'bg-accent',
	'success': 'bg-success',
	'error': 'bg-error',
	'warning': 'bg-warning',
	'text': 'bg-text',
	'white': 'bg-white',
	'disabled' : 'bg-disabled'
}

const Button = ({ children, color, customStyling, action }: ButtonProps) => {
	return (
		<button 
			className={`${btnColor[color]} ${customStyling} px-5 py-4 rounded-sm`}
			onClick={action}
		>
			{children}
		</button>
	);
}

export default Button; 