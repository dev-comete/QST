import type React from "react";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type { ColorTheme } from "../../../other/types/common";
import FAIcon from "../../atoms/Icon/FAIcon";

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
	interiorIcon?: string
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
	interiorIcon
} : ActionButtonProps) => {
	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		action?.(e);
	};
	const combinedStyles = `${btnStyling ?? ''} ${className ?? ''}`.trim();

	return (
		<Button
			color={btnColor}
			className={combinedStyles}
			onClick={handleClick}
			disabled={disabled}
			type={type}
			form={form}
			isLoading={isLoading}
			title={title}
		>
			<span className="flex items-center justify-center gap-1">
				{ interiorIcon && <FAIcon name={interiorIcon} className={"text-" + textColor} size="xs"/>}
				<CustomText color={textColor} weight="bold">{children}</CustomText>
			</span>
		</Button>
	)
}

export default ActionButton