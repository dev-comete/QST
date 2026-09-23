import ActionButton from "./ActionButton";
import { useState, type ReactNode } from "react";
import { ConfirmModal } from "../Modal/Modal";
import type { ColorTheme } from "../../../other/types/common";

interface ConfirmActionButtonProps {
	action: () => Promise<void>
	children: ReactNode
	btnColor?: ColorTheme
	confirmText?: string
	isLoading?: boolean
}

const ConfirmActionButton = ({
	action,
	btnColor = 'primary',
	children,
	confirmText = "Souhaitez-vous poursuivre ?",
	isLoading,
} : ConfirmActionButtonProps) => {

	const [ isOpen, setIsOpen ] = useState(false);

	return (
		<>
			{	isOpen && 
					<ConfirmModal
						content={confirmText}
						onClick={action}
						closeModal={() => setIsOpen(false)}
						bgColor="white"
						isOpen={isOpen}
						isLoading={isLoading}
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