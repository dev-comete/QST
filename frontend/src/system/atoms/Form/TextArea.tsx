interface TextArea {
    id: string;
	name: string;
	label?: string;
	value: string;
    placeholder?: string;
    rows?: number;
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
    rows = 1,
    cols = 0,
    readonly = false,
    required = false,
    minLength = 5,
    maxLength = 50,
	onChange
}: TextArea) => {

    const styling = "bg-background-900 p-2 w-full focus:outline-accent focus:outline-1 resize-none overflow-y-auto";
			
	return (
		<div className="flex flex-col w-full">
			{label && <label className="text-text" htmlFor={name}>{label}</label>}
			<textarea
                placeholder={placeholder}
				id={id}
				name={name}
				value={value}
                wrap="soft"
                rows={rows}
                cols={cols}
                minLength={minLength}
                maxLength={maxLength}
                readOnly={readonly}
                required={required}
				className={styling}
				onChange={onChange}
            />
		</div>
	)
}

export default TextArea;