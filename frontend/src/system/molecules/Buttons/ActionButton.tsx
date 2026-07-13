import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";

interface ActionButtonProps {
	children: React.ReactNode;
	btnColor: string;
	btnStyling?: string;
	textColor?: string;
	action : () => void;
}

const ActionButton = ({
	children,
	btnColor,
	btnStyling,
	textColor = "white",
	action
} : ActionButtonProps) => {
	return (
		<Button
			color={btnColor}
			customStyling={btnStyling}
			action={action}
		>
			<CustomText color={textColor} weight="bold">{children}</CustomText>
		</Button>
	)
}

export default ActionButton