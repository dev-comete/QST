import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";

interface ModalProps {
	children: React.ReactNode,
	bgColor: string;
}

interface ConfirmModalProps {
	closeModal: () => void;
	action: () => void;
	content: string;
	bgColor: string
}

interface BasicModalProps {
	content: string;
	btnContent: string;
	action: () => void;
	bgColor: string
}

const Modal = ({
	children,
	bgColor
} : ModalProps) => {
	return (
		<Paper color={bgColor}>
			<Box property="absolute" direction="column">
				{children}
			</Box>
		</Paper>
	)
}

const ConfirmModal = ({
	closeModal,
	action,
	content,
	bgColor = "white"
}: ConfirmModalProps) => {
	return (
		<Modal bgColor={bgColor}>
			<CustomText type="p">{content}</CustomText>
			<Box>
				<Button action={action}>Oui</Button>
				<Button action={closeModal}>Non</Button>
			</Box>
		</Modal>
	)
}

const BasicModal = ({
	action,
	content,
	btnContent,
	bgColor
}: BasicModalProps) => {
	return (
		<Modal bgColor={bgColor}>
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