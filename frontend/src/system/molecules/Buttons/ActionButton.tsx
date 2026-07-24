import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type { ColorTheme } from "../../../other/types/common";

interface ActionButtonProps {
	children: React.ReactNode;
	btnColor?: ColorTheme;
	btnStyling?: string;
	textColor?: ColorTheme;
	action : () => void;
}

const ActionButton = ({
	children,
	btnColor = "white",
	btnStyling,
	textColor = "text",
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