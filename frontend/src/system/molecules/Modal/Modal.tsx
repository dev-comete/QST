// frontend/src/system/molecules/Modal/Modal.tsx
import type React from "react";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import ActionButton from "../Buttons/ActionButton";
import type { ColorTheme } from "../../../other/types/common";
// Ajout de useEffect pour bloquer le scroll
import { Children, useState, type ReactNode, useEffect } from "react"; 
import Title from "../LayoutElement/Title";
import IconButton from "../Buttons/IconButton";
import { CancelButton } from "../Buttons/CustomizedButton";

interface ModalProps {
    bgColor?: ColorTheme,
    title?: string
    titleButton?: ReactNode
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

/* ==========================================
   ANCIEN CODE : ModalNav
   ==========================================
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
*/

// NOUVEAU CODE : ModalNav (Ajout de l'indicateur de page)
const ModalNav = ({ subIdx, increaseIdx, decreaseIdx, subtitle } : ModalSubtitleProps) => {
    return (
        <Box className="justify-between w-full mt-4 flex-none">
            <IconButton
                action={decreaseIdx}
                textColor="text"
                btnColor={ subIdx > 0 ? "accent" : "disabled" }
                disabled={ subIdx > 0 ? false : true }
                iconName="chevron-left"
            />
            <CustomText textTag="span" color="disabled" className="text-sm self-center">
                {subIdx + 1} / {subtitle.length}
            </CustomText>
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

/* ==========================================
   ANCIEN CODE : Modal
   ==========================================
const Modal = ({
    title, titleButton,
    subtitle,
    children,
    bgColor = "white",
    isOpen,
    closeModal,
    footer,
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
                        md:max-w-[80%] md:min-w-[25%] md:min-w-[400px] w-full
                        md:max-h-[85vh] h-full
                        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        z-101
                        p-6
                        flex flex-col
                        shadow-2xl border border-slate-100
                    "
            >
                
                <Box className="relative justify-between items-start w-full mb-5 flex-none">
					{
						closeModal &&
						<div className="absolute mr-1">
							<IconButton
								action={() => { closeModal() ; setSubIdx(0)}}
								btnColor="transparent"
								iconName="circle-xmark"
								iconStyling="text-slate-400 hover:text-error transition-colors text-xl"
							/>
						</div>
					}
                    <Box direction="column" className="flex-1">
                        { title &&  <Title title={title} titleTag="h3" sideButton={ <Box>
                            {titleButton}
                            {closeModal && <div className="-mt-1 -mr-1">
                                <IconButton action={() => { closeModal() ; setSubIdx(0)}} btnColor="transparent" iconName="circle-xmark" iconStyling="text-slate-400 hover:text-error transition-colors text-xl" />
                            </div>}
                        </Box>} /> }
                        { subtitle && 
                            <CustomText textTag="h3" color="disabled" className="mt-1">
                                {subtitle[subIdx]}
                            </CustomText>
                        }
                    </Box>
                </Box>
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
                
                {footer && 
                    <Box direction="column" className="items-center mt-6 pt-4 border-t border-slate-100 flex-none w-full">
                        {footer}
                    </Box>
                }
            </Paper>
        </>
    )
}
*/

// NOUVEAU CODE : Modal (Séparation stricte Header/Body scrollable/Footer et animations)
const Modal = ({
    title, titleButton,
    subtitle,
    children,
    bgColor = "white",
    isOpen,
    closeModal,
    footer,
} : ModalProps) => {
    const [ subIdx, setSubIdx ] = useState(0)
    
    // Empêche le défilement de l'arrière-plan quand la modal est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const subPage = Children.toArray(children);
    const currentChild = subPage[subIdx] ?? subPage[0] ?? null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Arrière-plan (Backdrop) avec animation fade-in */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
                onClick={closeModal}
            ></div>
            
            {/* Conteneur de la Modal avec animation scale et fade */}
            <Paper
                color={bgColor}
                position="relative"
                hasShadow
                className="
                    flex flex-col w-full max-w-[95vw] md:max-w-2xl lg:max-w-3xl 
                    max-h-[90vh] md:max-h-[85vh] 
                    rounded-2xl overflow-hidden
                    shadow-2xl border border-slate-100
                    animate-in zoom-in-95 fade-in duration-300 ease-out
                "
            >
                {/* En-tête (Header Fixe) */}
                <div className="flex-none px-6 py-5 border-b border-slate-100">
                    <Box className="flex-row justify-between items-start w-full">
                        <Box direction="column" className="flex-1">
                            { title &&  
                                <Title 
                                    title={title} 
                                    titleTag="h3" 
                                    sideButton={ 
                                        <Box className="items-center gap-2"> 
                                            {titleButton} 
                                            {closeModal && 
                                                <IconButton 
                                                    action={() => { closeModal() ; setSubIdx(0)}} 
                                                    btnColor="transparent" 
                                                    iconName="xmark" // Utilisation d'une croix plus épurée
                                                    iconStyling="text-slate-400 hover:text-slate-700 transition-colors text-xl" 
                                                    className="p-1 rounded-md hover:bg-slate-100"
                                                />
                                            }
                                        </Box>
                                    } 
                                />
                            }
                            { subtitle && 
                                <CustomText textTag="p" color="disabled" className="mt-2 text-sm">
                                    {subtitle[subIdx]}
                                </CustomText>
                            }
                        </Box>
                    </Box>
                </div>

                {/* Corps (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <Box direction="column" className="w-full">
                        {currentChild}
                    </Box>
                </div>

                {/* Pied de page (Footer Fixe) */}
                { (subtitle || footer) && (
                    <div className="flex-none px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        { subtitle && 
                            <ModalNav 
                                subIdx={subIdx}
                                decreaseIdx={() => setSubIdx(prev => prev - 1)}
                                increaseIdx={() => setSubIdx(prev => prev + 1)}
                                subtitle={subtitle}
                            />
                        }
                        {footer && 
                            <Box className="w-full justify-end items-center gap-3 mt-1">
                                {footer}
                            </Box>
                        }
                    </div>
                )}
            </Paper>
        </div>
    )
}

/* ConfirmModal et TextModal ne changent pas fondamentalement, on les laisse tels quels */
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
            closeModal={closeModal}
            footer={
                <>
                    <CancelButton onClick={closeModal}/>
                    <ActionButton
                        btnColor="primary"
                        onClick={handleCloseModal}
                        isLoading={isLoading}
                    >
                        Oui, confirmer
                    </ActionButton>
                </>
            }
        >
            <CustomText textTag="p" className="text-slate-600">
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
                <Button onClick={action}>{btnContent}</Button>
            }
        >
            <CustomText textTag="p" className="text-slate-600">
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