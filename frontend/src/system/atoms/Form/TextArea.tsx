interface TextArea {
    id: string;
	name: string;
	label?: string;
    placeholder?: string;
    rows?: number;
    cols?: number;
    minLength?: number;
    maxLength?: number;
    readonly?: boolean;
    required?: boolean;
}

const TextArea = ({
	label,
	id,
	name,
    placeholder,
    rows = 3,
    cols = 0,
    readonly = false,
    required = false,
    minLength = 5,
    maxLength = 50
}: TextArea) => {

    const styling = "bg-white focus:outline-accent focus:outline-1 resize-none";
			
	return (
		<div className="flex flex-col">
			{label && <label className="text-text">{label}</label>}
			<textarea
                placeholder={placeholder}
				id={id}
				name={name}
                wrap="soft"
                rows={rows}
                cols={cols}
                minLength={minLength}
                maxLength={maxLength}
                readOnly={readonly}
                required={required}
				className={styling}
            />
		</div>
	)
}

export default TextArea;