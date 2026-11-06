import LabelInput from "./LabelInput";
import CustomText from "../Text/CustomText";
import Box from "../Container/Box";
import IconButton from "../../molecules/Buttons/IconButton";
import FAIcon from "../Icon/FAIcon";

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
		<div className="flex flex-col w-full gap-3">
			{label && <CustomText className="uppercase text-center" weight="bold">{label}</CustomText>}
			<label
				htmlFor={id}
				className={`
					rounded-xl p-5 w-full text-center
					${file ? 'border border-success' : 'hover:bg-secondary border-primary border-2 border-dashed'}
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
				<Box className={`${file ? 'justify-between' : 'justify-center'} items-center w-full`}>
					<Box className="items-center">
						{file && <FAIcon name="file-lines" className="text-success p-2 rounded-full bg-success-light" size="lg"/>}
						<CustomText weight="bold" color={file? 'text' : 'primary'}>
							{file ? file.name : 'Cliquez pour choisir un fichier'}
						</CustomText>
					</Box>
					{file && !disabled && (
						<IconButton
							iconName="trash"
							action={() => onChange(null)}
							title="Retirer le fichier"
							className="hover:text-error"
						/>
					)}
				</Box>
				{helper && !file && (
					<CustomText textTag="p" color="disabled" className="mt-1 text-sm">{helper}</CustomText>
				)}
			</label>
		</div>
	)
}

export default FileInput;
