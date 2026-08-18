import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import ActionButton from "../Buttons/ActionButton";
import type { ColorTheme } from "../../../other/types/common";
import { Children, useState } from "react";
import Title from "../LayoutElement/Title";
import IconButton from "../Buttons/IconButton";

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

const ModalNav = ({ subIdx, increaseIdx, decreaseIdx, subtitle } : ModalSubtitleProps) => {

	return (
		<Box className="justify-between w-full">
			<IconButton
				action={decreaseIdx}
				textColor="text"
				btnColor={ subIdx > 0 ? "accent" : "disabled" }
				disabled={ subIdx > 0 ? false : true }
				iconName="chevron-left"
			/>
			<IconButton
				action={increaseIdx}
				textColor="text"
				btnColor={ subIdx < subtitle.length - 1 ? "accent" : "disabled" }
				disabled={ subIdx < subtitle.length - 1 ? false : true }
				iconName="chevron-right"
			/>
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

	const modalOverlayStyling = "fixed top-0 left-0 w-full h-full bg-black/90 z-100";

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
				className="
					rounded-xl
					w-[50%] max-h-[85vh] h-[85vh]
					top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
					z-101
					p-5
					flex flex-col
					"
			>
				<Box direction="column" className="justify-between h-full w-full min-h-0">
					<Box direction="column" className="justify-between grow min-h-0">
						<div className="flex justify-end px-2 flex-none">
							{ closeModal && 
								<IconButton
									action={() => { closeModal() ; setSubIdx(0)}}
									btnColor="transparent"
									iconName="circle-xmark"
								/>
							}
						</div>

						<Box direction="column" className="justify-between items-center p-3 grow min-h-0">
							<Box direction="column" className="flex-none w-full mb-3">
								{ title && <Title title={title} /> }
								{ subtitle && <CustomText textTag="h3">{subtitle[subIdx]}</CustomText>}
							</Box>

							<Box className="grow w-full overflow-y-auto min-h-0">
								{subPage[subIdx]}
							</Box>
						</Box>
					</Box>

					{ subtitle &&
						<ModalNav 
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