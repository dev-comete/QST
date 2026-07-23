import type React from "react";
import { backgroundColor } from "../../../other/types/constant";
import type { ColorTheme } from "../../../other/types/common";

interface ButtonProps {
	children?: React.ReactNode;
	color?: ColorTheme;
	customStyling?: string;
	paddingX?: number;
	paddingY?: number;
	action : () => void;
}

const Button = ({
	children,
	color = 'white',
	customStyling,
	action 
}: ButtonProps) => {

	return (
		<button 
			className={`${backgroundColor[color]} ${customStyling} px-3 py-2 rounded-sm w-fit`}
			onClick={action}
		>
			{children}
		</button>
	);
}

export default Button; 