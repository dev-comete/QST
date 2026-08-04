interface SelectProps {
    id: string;
	name: string;
	label?: string;
    required?: boolean;
    values: { id: string, value: string }[];
    size?: number;
	handleChange: () => void
}

const Select = ({
	label,
	id,
	name,
    required = false,
    values,
    size = 1,
	handleChange
}: SelectProps) => {

    const styling = "bg-white focus:outline-none outline-none";
			
	return (
		<div className="flex flex-col">
			{label && <label className="text-text" htmlFor={name}>{label}</label>}
			<select
				id={id}
				name={name}
                required={required}
                size={size}
				className={styling}
				onChange={handleChange}
            >
                {
                    values.map(({id, value}) => (
                        <option key={id} value={value}>{value}</option>
                    ))
                }
            </select>
		</div>
	)
}

export default Select;