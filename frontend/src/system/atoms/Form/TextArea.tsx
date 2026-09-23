import { useEffect, useRef } from "react";
import LabelInput from "./LabelInput";

interface TextAreaProps {
    id: string;
    name: string;
    label?: string;
    value: string;
    placeholder?: string;
    cols?: number;
    minLength?: number;
    maxLength?: number;
    readonly?: boolean;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({
    label,
    id,
    name,
    value,
    placeholder,
    cols = 0,
    readonly = false,
    required = false,
    minLength = 5,
    maxLength = 1000,
    onChange
}: TextAreaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Recalculate height whenever value changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    const styling = "bg-white border border-background p-2 w-full focus:outline-accent focus:outline-1 resize-none overflow-y-auto max-h-[7.5rem] rounded-xl"; 

    return (
        <div className="flex flex-col w-full">
            {label && <LabelInput label={label} htmlFor={name} required={required}/>}
            <textarea
                ref={textareaRef}
                placeholder={placeholder}
                id={id}
                name={name}
                value={value}
                rows={1} // Start at 1 row
                wrap="soft"
                cols={cols}
                minLength={minLength}
                maxLength={maxLength}
                readOnly={readonly}
                required={required}
                className={styling}
                onChange={onChange}
            />
        </div>
    );
};

export default TextArea;