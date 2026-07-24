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
	action : () => void;
}

const Button = ({
	children,
	color = 'white',
	isRounded = true,
	customStyling,
	action 
}: ButtonProps) => {

	const roundParam = isRounded ? "rounded-sm" : ""

	return (
		<button 
			className={`${backgroundColor[color]} ${customStyling} px-3 py-2 ${roundParam} w-fit`}
			onClick={action}
		>
			{children}
		</button>
	);
}

export default Button; 