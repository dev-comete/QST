import type React from "react";
import ActionButton from "./ActionButton";
import { useState } from "react";
import { ConfirmModal } from "../Modal/Modal";
import type { ColorTheme } from "../../../other/types/common";

interface ConfirmActionButtonProps {
	action: () => void //Send the action to the modal
	children: React.ReactNode
	btnColor?: ColorTheme
	confirmText?: string
}

const ConfirmActionButton = ({
	action,
	btnColor = 'primary',
	children,
	confirmText = "Souhaitez-vous poursuivre ?"
} : ConfirmActionButtonProps) => {

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
			<ActionButton
				btnColor={btnColor}
				onClick={() => setIsOpen(true)}
			>
				{children}
			</ActionButton>
		</>
	)
}

export default ConfirmActionButton;