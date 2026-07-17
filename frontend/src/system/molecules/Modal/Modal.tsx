import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import ActionButton from "../Buttons/ActionButton";

interface ModalProps {
	children: React.ReactNode,
	bgColor: string;
	isOpen: boolean;
}

interface ConfirmModalProps {
	closeModal: () => void;
	action: () => void;
	content: string;
	bgColor: string;
		isOpen: boolean;

}

interface BasicModalProps {
	content: string;
	btnContent: string;
	action: () => void;
	bgColor: string;
		isOpen: boolean;

}

const Modal = ({
	children,
	bgColor,
	isOpen
} : ModalProps) => {

	const modalOverlayStyling = "fixed top-0 left-0 w-full h-full bg-black/50 z-100";

	const checkModal = isOpen ? null : 'hidden';

	return (
		<>
			<div className={`${modalOverlayStyling} ${checkModal}`}></div>
			<Paper
				color={bgColor}
				position="fixed"
				customStyling="p-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101"
			>
				<Box direction="column" customStyling="justify-center items-center">
					{children}
				</Box>
			</Paper>
		</>
	)
}

const ConfirmModal = ({
	closeModal,
	action,
	content,
	bgColor = "white",
	isOpen
}: ConfirmModalProps) => {
	return (
		<Modal bgColor={bgColor} isOpen={isOpen}>
			<CustomText type="p">{content}</CustomText>
			<Box>
				<ActionButton
					btnColor="secondary"
					action={() => { 
						action() ; closeModal()
					}} 
				>Oui</ActionButton>
				<ActionButton
					btnColor="secondary"
					action={closeModal}
				>Non</ActionButton>
			</Box>
		</Modal>
	)
}

const BasicModal = ({
	action,
	content,
	btnContent,
	bgColor,
	isOpen
}: BasicModalProps) => {
	return (
		<Modal bgColor={bgColor} isOpen={isOpen}>
			<CustomText type="p">{content}</CustomText>
			<Box>
				<Button action={action}>{btnContent}</Button>
			</Box>
		</Modal>
	)
}

export {
	ConfirmModal,
	BasicModal
};