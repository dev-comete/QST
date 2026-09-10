interface LabelInputProps {
	label: string,
	htmlFor?: string
}

const LabelInput = ({ label, htmlFor } : LabelInputProps) => {
	return (
		<label className="text-md font-medium text-text text-md" htmlFor={htmlFor}>
			{label}
		</label>
	)
}

export default LabelInput;