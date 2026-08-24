import type React from "react";
import Button from "../../atoms/Button/Button"
import type { ColorTheme } from "../../../other/types/common";
import FAIcon from "../../atoms/Icon/FAIcon";

interface IconButtonProps {
	btnColor?: ColorTheme,
	btnStyling?: string,
	textColor?: ColorTheme,
	action? : (event: React.MouseEvent<HTMLButtonElement>) => void,
	disabled? : boolean,
	type?: 'submit' | 'reset' | 'button',
	form?: string,
	iconName: string
	iconStyling?: string
}

const IconButton = ({
	btnColor = "transparent",
	btnStyling,
	disabled = false,
	type,
	form,
	action,
	iconName,
	iconStyling
} : IconButtonProps) => {
	return (
		<Button
			color={btnColor}
			className={`${btnStyling} cursor-pointer`}
			action={action}
			disabled={disabled}
			type={type}
			form={form}
		>
			<FAIcon name={iconName} className={iconStyling}/>
		</Button>
	)
}

export default IconButton