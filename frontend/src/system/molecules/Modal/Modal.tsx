import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import ActionButton from "../Buttons/ActionButton";
import type { ColorTheme } from "../../../other/types/common";
import { Children, useState } from "react";

interface ModalProps {
	bgColor?: ColorTheme,
	title?: string
	subtitle?: string[]
	children: React.ReactNode,
	isOpen?: boolean;
	closeModal?: () => void;
}

interface ConfirmModalProps {
	closeModal: () => void;
	action: () => void;
	content: string;
	bgColor: ColorTheme;
	isOpen: boolean;
}

interface BasicModalProps {
	content: string;
	btnContent: string;
	action: () => void;
	bgColor: ColorTheme;
	isOpen: boolean;
}

interface ModalSubtitleProps {
	subIdx : number,
	increaseIdx: () => void,
	decreaseIdx: () => void,
	subtitle: string[]
}

const ModalSubtitle = ({ subIdx, increaseIdx, decreaseIdx, subtitle } : ModalSubtitleProps) => {

	return (
		<Box customStyling="justify-between w-full">
			<ActionButton
				action={decreaseIdx}
				textColor="text"
				btnColor={ subIdx > 0 ? "accent" : "disabled" }
				disabled={ subIdx > 0 ? false : true }
			>{"<-"}</ActionButton>
			<ActionButton
				action={increaseIdx}
				textColor="text"
				btnColor={ subIdx < subtitle.length - 1 ? "accent" : "disabled" }
				disabled={ subIdx < subtitle.length - 1 ? false : true }
			>{"->"}</ActionButton>
		</Box>
	)
}

const Modal = ({
	title,
	subtitle,
	children,
	bgColor = "background",
	isOpen,
	closeModal
} : ModalProps) => {

	const modalOverlayStyling = "fixed top-0 left-0 w-full h-full bg-black/50 z-100";

	const checkModal = isOpen ? null : 'hidden';

	const [ subIdx, setSubIdx ] = useState(0)
	const subPage = Children.toArray(children);

	if (!isOpen)
		return null;

	return (
		<>
			<div className={`${modalOverlayStyling} ${checkModal}`}></div>
			<Paper
				color={bgColor}
				position="fixed"
				customStyling="
					p-5 min-w-[30%] max-w-[80%]
					top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
					z-101"
			>
				<Box direction="column" customStyling="justify-center items-center">
					{ closeModal && 
						<ActionButton
							action={closeModal}
							btnColor="transparent"
							btnStyling="self-end"
						>{"x"}</ActionButton>
					}
					{ title && <CustomText textTag="h3">{title}</CustomText> }
					{ subtitle && <CustomText textTag="h2">{subtitle[subIdx]}</CustomText>}
					{subPage[subIdx]}
					{ subtitle &&
						<ModalSubtitle 
							subIdx={subIdx}
							decreaseIdx={() => setSubIdx(prev => prev - 1)}
							increaseIdx={() => setSubIdx(prev => prev + 1)}
							subtitle={subtitle}
						/>
					}
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
			<CustomText textTag="p">{content}</CustomText>
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

const TextModal = ({
	action,
	content,
	btnContent,
	bgColor,
	isOpen
}: BasicModalProps) => {
	return (
		<Modal bgColor={bgColor} isOpen={isOpen}>
			<CustomText textTag="p">{content}</CustomText>
			<Box><Button action={action}>{btnContent}</Button></Box>
		</Modal>
	)
}

export {
	ConfirmModal,
	TextModal,
	Modal
};