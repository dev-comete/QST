import type React from "react";
import ActionButton from "./ActionButton";
import { useState } from "react";
import { ConfirmModal } from "../Modal/Modal";

interface ConfirmActionButtonProps {
	action: () => void; //Send the action to the modal
	children: React.ReactNode;
	btnColor: string
}

const ConfirmActionButton = ({
	action,
	btnColor,
	children,
} : ConfirmActionButtonProps) => {

	const [ isOpen, setIsOpen ] = useState(false);

	return (
		<>
			{	isOpen && 
					<ConfirmModal
						content="Voulez-vous envoyer la réponse ?"
						action={action}
						closeModal={() => setIsOpen(false)}
						bgColor="white"
						isOpen={isOpen}
					/>
			}
			<ActionButton
				btnColor={btnColor}
				action={() => setIsOpen(true)}
			>
				{children}
			</ActionButton>
		</>
	)
}

export default ConfirmActionButton;