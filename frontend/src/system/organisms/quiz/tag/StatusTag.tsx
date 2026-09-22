import CustomText from "../../../atoms/Text/CustomText";

const StatusTag = ({ status } : { status : string}) => {
	return (
		<CustomText
			weight="bold"
			textTag="h6"
			color={`${status === 'draft' ? 'primary' : 'success'}`}
			className={`p-2 rounded-sm ${status === 'draft' ? 'bg-disabled-light' : 'bg-success-light'} shadow-sm` }
		>
			{ status === 'draft' ? 'Brouillon' : 'Publié'}
		</CustomText>
	)
}

export default StatusTag;