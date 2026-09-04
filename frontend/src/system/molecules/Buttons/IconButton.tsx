import type React from "react";
import Button from "../../atoms/Button/Button"
import type { ColorTheme } from "../../../other/types/common";
import FAIcon from "../../atoms/Icon/FAIcon";
import { useState } from "react";
import { ConfirmModal } from "../Modal/Modal";

interface IconConfirmActionButtonProps {
	action: () => void;
	btnColor?: ColorTheme
	btnStyling?: string,
	textColor?: ColorTheme,
	disabled? : boolean,
	type?: 'submit' | 'reset' | 'button',
	form?: string,
	iconName: string
	iconStyling?: string
	confirmText?: string
}

export const IconConfirmActionButton = ({
	action,
	btnColor = 'transparent',
	iconName,
	form,
	disabled,
	type,
	btnStyling,
	confirmText = "Souhaitez-vous poursuivre ?"
} : IconConfirmActionButtonProps) => {

	const [ isOpen, setIsOpen ] = useState(false);

	return (
		<>
			{	isOpen && 
					<ConfirmModal
						content={confirmText}
						action={action}
						closeModal={() => setIsOpen(false)}
						bgColor="white"
						isOpen={isOpen}
					/>
			}
			<IconButton
				btnColor={btnColor}
				btnStyling={`${btnStyling} cursor-pointer`}
				action={() => setIsOpen(true)}
				disabled={disabled}
				type={type}
				form={form}
				iconName={iconName}
			/>
		</>
	)
}


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
			onClick={action}
			disabled={disabled}
			type={type}
			form={form}
		>
			<FAIcon name={iconName} className={iconStyling}/>
		</Button>
	)
}

export default IconButton