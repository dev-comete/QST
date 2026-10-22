import type { ReactNode } from "react";
import type { ColorTheme } from "../../../other/types/common";
import LabelInput from "./LabelInput";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'search' | 'time' | 'checkbox' | 'date' | 'datetime-local' | 'radio' | 'number' | 'month';
    id: string;
    name: string;
    textColor?: ColorTheme;
    htmlFor?: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    labelPosition?: 'col' | 'row';
}

const Input = ({
    label,
    type = 'text',
    id,
    name,
    className,
    htmlFor,
    endIcon,
    startIcon,
    labelPosition = 'col',
    ...rest // Capture toutes les autres props (disabled, value, onChange, etc.)
}: InputProps) => {

    const basicStyle = `flex p-2 rounded-xl ${type !== 'checkbox' && 'border'} border-background w-full items-center justify-center focus:outline focus:outline-primary`
    const hasCustomBackground = Boolean(className?.match(/(^|\s)bg-(?:\[[^\]]+\]|[A-Za-z0-9/-]+)/))
    
    const inputClasses = [
        'w-full pr-12 [&::-webkit-search-cancel-button]:appearance-none',
        basicStyle,
        !hasCustomBackground && 'bg-white',
        rest.readOnly && !hasCustomBackground && 'bg-error/10',
        className,
    ].filter(Boolean).join(' ')

    return (
        <div className={`flex ${labelPosition === 'col' ? 'flex-col' : 'flex-row items-center space-x-2'} w-full relative`}>
            { label && <LabelInput label={label} htmlFor={htmlFor || id} required={rest.required}/> }
            <div className="relative w-full flex items-center">
                {startIcon && (
                    <div className="absolute left-2 top-1/2 flex items-center justify-center">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    id={id}
                    name={name}
                    className={inputClasses}
                    autoComplete={type}
                    {...rest}
                />
                {endIcon && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
                        {endIcon}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Input;