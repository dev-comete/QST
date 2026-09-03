import type React from "react";
import { backgroundColor } from "../../../other/types/constant";
import type { ColorTheme } from "../../../other/types/common";

interface ButtonProps {
    children?: React.ReactNode;
    color?: ColorTheme;
    className?: string;
    paddingX?: number;
    paddingY?: number;
    isRounded?: boolean;
    disabled?: boolean;
    action?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'submit' | 'reset' | 'button';
    form?: string;
}

const Button = ({
    children,
    color = 'primary',
    isRounded = true,
    className = "",
    disabled = false,
    type = 'button',
    form,
    action 
}: ButtonProps) => {

    const roundParam = isRounded ? "rounded-lg" : "";
    
    const isLightColor = color === 'white' || color === 'secondary' || color === 'background';

    const hoverEffect = isLightColor 
        ? "hover:brightness-90 active:brightness-75" 
        : "hover:opacity-85 active:opacity-95";

    const isDisable = disabled 
        ? "disabled:opacity-50 disabled:cursor-not-allowed" 
        : `cursor-pointer ${hoverEffect} transition-all duration-200`;

    return (
        <button 
            className={`${backgroundColor[color]} focus:outline focus:outline-accent px-3 py-2 ${roundParam} w-fit ${isDisable} ${className}`}
            disabled={disabled}
            onClick={action}
            type={type}
            form={form}
        >
            {children}
        </button>
    );
};

export default Button;