import { forwardRef, useRef } from "react";
import LabelInput from "./LabelInput";

interface TextAreaProps {
    id: string;
    name: string;
    label?: string;
    value: string;
    placeholder?: string;
    cols?: number;
	row?: number
    minLength?: number;
    maxLength?: number;
    readonly?: boolean;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    id,
    name,
    value,
    placeholder,
    cols = 0,
	row = 1,
    readonly = false,
    required = false,
    minLength = 5,
    maxLength = 1000,
    onChange
}, forwardedRef) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // useEffect(() => {
    //     const textarea = textareaRef.current;
    //     if (textarea) {
    //         textarea.style.height = "auto";
    //         textarea.style.height = `${textarea.scrollHeight}px`;
    //     }
    // }, [value]);

    const styling = "bg-white border border-background p-2 w-full focus:outline-accent focus:outline-1 resize-none overflow-y-auto max-h-[7.5rem] rounded-xl"; 

    return (
        <div className="flex flex-col w-full">
            {label && <LabelInput label={label} htmlFor={name} required={required}/>}
            <textarea
                ref={(element) => {
                    textareaRef.current = element;
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(element);
                    } else if (forwardedRef) {
                        forwardedRef.current = element;
                    }
                }}
                placeholder={placeholder}
                id={id}
                name={name}
                value={value}
                rows={row}
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
});

TextArea.displayName = 'TextArea';

export default TextArea;