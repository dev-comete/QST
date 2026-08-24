import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type { ColorTheme } from "../../../other/types/common";

interface ActionButtonProps {
	children: React.ReactNode,
	btnColor?: ColorTheme,
	btnStyling?: string,
	textColor?: ColorTheme,
	action? : (event: React.MouseEvent<HTMLButtonElement>) => void,
	disabled? : boolean,
	type?: 'submit' | 'reset' | 'button',
	form?: string
}

const ActionButton = ({
	children,
	btnColor = "primary",
	btnStyling,
	textColor = "white",
	disabled = false,
	type,
	form,
	action
} : ActionButtonProps) => {
	return (
		<Button
			color={btnColor}
			className={btnStyling}
			action={action}
			disabled={disabled}
			type={type}
			form={form}
		>
			<CustomText color={textColor} weight="bold">{children}</CustomText>
		</Button>
	)
}

export default ActionButton