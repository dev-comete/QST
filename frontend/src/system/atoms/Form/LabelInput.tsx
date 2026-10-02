interface LabelInputProps {
	label: string,
	htmlFor?: string
	required?: boolean
}

const LabelInput = ({ label, htmlFor, required = false } : LabelInputProps) => {
	return (
		<label className="text-md font-medium text-text w-full" htmlFor={htmlFor}>
			{`${label} ${required == true ? '*' : ''}`}
		</label>
	)
}

export default LabelInput;