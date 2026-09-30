import type React from "react";
import Button from "../../atoms/Button/Button"
import type { ColorTheme } from "../../../other/types/common";
import FAIcon from "../../atoms/Icon/FAIcon";
import { useState } from "react";
import { ConfirmModal } from "../Modal/Modal";
import type { SizeProp } from "@fortawesome/fontawesome-svg-core";

interface IconConfirmActionButtonProps {
    action: () => Promise<void>; // or () => Promise<unknown>
    btnColor?: ColorTheme
    btnStyling?: string,
    className?: string, // [NEW CODE ADDED]
    textColor?: ColorTheme,
    disabled? : boolean,
    type?: 'submit' | 'reset' | 'button',
    form?: string,
    iconName: string
    iconStyling?: string
    confirmText?: string
    isLoading?: boolean
    title?: string
}

export const IconConfirmActionButton = ({
    action,
    btnColor = 'transparent',
    iconName,
    form,
    disabled,
    type,
    btnStyling,
    className, // [NEW CODE ADDED]
    confirmText = "Souhaitez-vous poursuivre ?",
    isLoading,
    title,
    iconStyling
} : IconConfirmActionButtonProps) => {

    const [ isOpen, setIsOpen ] = useState(false);

    return (
        <>
            {   isOpen && 
                    <ConfirmModal
                        content={confirmText}
                        onClick={action}
                        closeModal={() => setIsOpen(false)}
                        bgColor="white"
                        isOpen={isOpen}
                        isLoading={isLoading}
                    />
            }
            <IconButton
                btnColor={btnColor}
                btnStyling={btnStyling}
                className={className} // [NEW CODE ADDED]
                action={() => setIsOpen(true)}
                disabled={disabled}
                type={type}
                form={form}
                iconName={iconName}
                title={title}
                iconStyling={iconStyling}
            />
        </>
    )
}


interface IconButtonProps {
    btnColor?: ColorTheme,
    btnStyling?: string,
    className?: string, // [NEW CODE ADDED]
    textColor?: ColorTheme,
    action? : (event: React.MouseEvent<HTMLButtonElement>) => void,
    disabled? : boolean,
    type?: 'submit' | 'reset' | 'button',
    form?: string,
    iconName: string
    iconStyling?: string
    title?: string
	iconSize?: SizeProp
}

const IconButton = ({
    btnColor = "transparent",
    btnStyling,
    className, // [NEW CODE ADDED]
    disabled = false,
    type,
    form,
    action,
    iconName,
    iconStyling,
    title,
	iconSize,
} : IconButtonProps) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        action?.(e);
    };

    // [NEW CODE ADDED]: Combine both btnStyling and className cleanly
    const combinedStyles = `${btnStyling ?? ''} ${className ?? ''} cursor-pointer border-0 bg-transparent p-0 shadow-none focus:outline-none rounded-full`.trim();

    return (
        <Button
            color={btnColor}
            className={combinedStyles}
            onClick={handleClick}
            disabled={disabled}
            type={type}
            form={form}
            title={title}
        >
            <FAIcon name={iconName} className={iconStyling} size={iconSize}/>
        </Button>
    )
}

export default IconButton;