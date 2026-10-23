import LabelInput from "./LabelInput";
import CustomText from "../Text/CustomText";

interface FileInputProps {
	id: string
	name: string
	label?: string
	accept?: string
	file: File | null
	onChange: (file: File | null) => void
	disabled?: boolean
	helper?: string
}

const FileInput = ({
	id,
	name,
	label,
	accept,
	file,
	onChange,
	disabled = false,
	helper,
}: FileInputProps) => {
	return (
		<div className="flex flex-col w-full">
			{label && <LabelInput label={label} htmlFor={id} />}
			<label
				htmlFor={id}
				className={`
					border-2 border-dashed border-primary rounded-xl p-5 w-full text-center
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-background'}
				`}
			>
				<input
					id={id}
					name={name}
					type="file"
					accept={accept}
					disabled={disabled}
					className="hidden"
					onChange={(e) => {
						onChange(e.target.files?.[0] ?? null)
						e.target.value = '' // lets the user pick the same file again after removing it
					}}
				/>
				<CustomText weight="bold" color="primary">
					{file ? file.name : 'Cliquez pour choisir un fichier'}
				</CustomText>
				{helper && !file && (
					<CustomText textTag="p" color="disabled" className="mt-1 text-sm">{helper}</CustomText>
				)}
			</label>
			{file && !disabled && (
				<button
					type="button"
					className="text-sm text-error underline self-end mt-1 cursor-pointer"
					onClick={() => onChange(null)}
				>
					Retirer le fichier
				</button>
			)}
		</div>
	)
}

export default FileInput;
