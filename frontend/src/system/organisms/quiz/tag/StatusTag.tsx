import CustomText from "../../../atoms/Text/CustomText";

const StatusTag = ({ status } : { status : string}) => {
	return (
		<CustomText textTag="h6" className={`p-2 rounded-xl ${status === 'draft' ? 'bg-background' : 'bg-success-light'}` }>
			{ status === 'draft' ? 'Brouillon' : 'Publié'}
		</CustomText>
	)
}

export default StatusTag;