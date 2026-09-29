import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import ActionButton from "../Buttons/ActionButton";
import type { ColorTheme } from "../../../other/types/common";
import { Children, useState, type ReactNode } from "react";
import Title from "../LayoutElement/Title";
import IconButton from "../Buttons/IconButton";

interface ModalProps {
    bgColor?: ColorTheme,
    title?: string
    subtitle?: string[]
    children: React.ReactNode,
    isOpen?: boolean;
    closeModal?: () => void;
    footer?: ReactNode
}

interface ConfirmModalProps {
    closeModal: () => void;
    onClick: () => Promise<void>;
    bgColor?: ColorTheme;
    isOpen: boolean;
    isLoading?: boolean
    content: string
}

interface BasicModalProps {
    content: string;
    btnContent: string;
    onClick: () => void;
    bgColor?: ColorTheme;
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
        <Box className="justify-between w-full mt-4">
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
    bgColor = "white",
    isOpen,
    closeModal,
    footer
} : ModalProps) => {

    const modalOverlayStyling = "fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-100 transition-opacity duration-300";

    const checkModal = isOpen ? null : 'hidden';

    const [ subIdx, setSubIdx ] = useState(0)

    const subPage = Children.toArray(children);
    const currentChild = subPage[subIdx] ?? subPage[0] ?? null;

    if (!isOpen)
        return null;

    return (
        <>
            <div className={`${modalOverlayStyling} ${checkModal}`} onClick={closeModal}></div>
            <Paper
                color={bgColor}
                position="fixed"
                className="
                        rounded-2xl
                        max-w-[80%] min-w-[25%] md:min-w-[400px]
                        max-h-[85vh]
                        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        z-101
                        p-6
                        flex flex-col
                        shadow-2xl border border-slate-100
                    "
            >
                {/* [ALTERED CODE]: Header section - aligned title and close button in a row */}
                <Box className="flex-row justify-between items-start w-full mb-5 flex-none">
                    <Box direction="column" className="flex-1 pr-4">
                        { title && <Title title={title} /> }
                        { subtitle && 
                            <CustomText textTag="h3" color="disabled" className="mt-1">
                                {subtitle[subIdx]}
                            </CustomText>
                        }
                    </Box>
                    { closeModal && 
                        <div className="-mt-1 -mr-1">
                            <IconButton
                                action={() => { closeModal() ; setSubIdx(0)}}
                                btnColor="transparent"
                                iconName="circle-xmark"
                                iconStyling="text-slate-400 hover:text-error transition-colors text-xl"
                            />
                        </div>
                    }
                </Box>

                {/* Content Section */}
                <Box className="grow w-full overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                    {currentChild}
                </Box>

                { subtitle &&
                    <ModalNav 
                        subIdx={subIdx}
                        decreaseIdx={() => setSubIdx(prev => prev - 1)}
                        increaseIdx={() => setSubIdx(prev => prev + 1)}
                        subtitle={subtitle}
                    />
                }
                
                {/* [ALTERED CODE]: Footer section - added top border and padding for visual separation */}
                {footer && 
                    <Box direction="column" className="items-center mt-6 pt-4 border-t border-slate-100 flex-none w-full">
                        {footer}
                    </Box>
                }
            </Paper>
        </>
    )
}

const ConfirmModal = ({
    closeModal,
    onClick: action,
    content,
    bgColor = "white",
    isOpen,
    isLoading,
}: ConfirmModalProps) => {

    const handleCloseModal = async () => {
        try {
            await action()
            closeModal()
        } catch (error) {
            console.log("Error", error)
        }
    }

    return (
        <Modal
            title="Confirmation"
            bgColor={bgColor}
            isOpen={isOpen}
            closeModal={closeModal} // Also allow clicking the 'X' to close
            footer={
                /* [ALTERED CODE]: Grouped buttons to the right (standard UX) instead of opposite corners */
                <Box className="w-full justify-end gap-3">
                    <ActionButton
                        btnColor="text"
                        onClick={closeModal} 
                        className="hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
                    >
                        Non, annuler
                    </ActionButton>
                    <ActionButton
                        btnColor="primary"
                        onClick={handleCloseModal}
                        isLoading={isLoading}
                    >
                        Oui, confirmer
                    </ActionButton>
                </Box>
            }
        >
            <CustomText textTag="p" className="text-slate-600 mt-2">
                {content}
            </CustomText>
        </Modal>
    )
}

const TextModal = ({
    onClick: action,
    content,
    btnContent,
    bgColor = "white",
    isOpen
}: BasicModalProps) => {
    return (
        <Modal
            bgColor={bgColor}
            isOpen={isOpen}
            footer={
                <Box className="w-full justify-end">
                    <Button onClick={action}>{btnContent}</Button>
                </Box>
            }
        >
            <CustomText textTag="p" className="text-slate-600 my-2">
                {content}
            </CustomText>
        </Modal>
    )
}

export {
    ConfirmModal,
    TextModal,
    Modal
};