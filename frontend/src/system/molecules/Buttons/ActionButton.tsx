import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type { ColorTheme } from "../../../other/types/common";

interface ActionButtonProps {
	children: React.ReactNode,
	btnColor?: ColorTheme,
	btnStyling?: string,
	className?: string,
	textColor?: ColorTheme,
	onClick? : (event: React.MouseEvent<HTMLButtonElement>) => void,
	disabled? : boolean,
	type?: 'submit' | 'reset' | 'button',
	form?: string
	isLoading?: boolean
	title?: string
}

const ActionButton = ({
	children,
	btnColor = "primary",
	btnStyling,
	className,
	textColor = "white",
	disabled = false,
	type,
	form,
	onClick: action,
	isLoading,
	title,
} : ActionButtonProps) => {
	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		action?.(e);
	};
	const combinedStyles = `${btnStyling ?? ''} ${className ?? ''}`.trim();

	return (
		<Button
			color={btnColor}
			//className={btnStyling}
			className={combinedStyles}
			onClick={handleClick}
			disabled={disabled}
			type={type}
			form={form}
			isLoading={isLoading}
			title={title}
		>
			<CustomText color={textColor} weight="bold">{children}</CustomText>
		</Button>
	)
}

export default ActionButton