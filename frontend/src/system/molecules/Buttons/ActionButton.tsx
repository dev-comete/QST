import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type { ColorTheme } from "../../../other/types/common";

interface ActionButtonProps {
	children: React.ReactNode,
	btnColor?: ColorTheme,
	btnStyling?: string,
	textColor?: ColorTheme,
	action? : () => void,
	disabled? : boolean,
	type?: 'submit' | 'reset' | 'button',
}

const ActionButton = ({
	children,
	btnColor = "white",
	btnStyling,
	textColor = "text",
	disabled = false,
	type,
	action
} : ActionButtonProps) => {
	return (
		<Button
			color={btnColor}
			customStyling={btnStyling}
			action={action}
			disabled={disabled}
			type={type}
		>
			<CustomText color={textColor} weight="bold">{children}</CustomText>
		</Button>
	)
}

export default ActionButton