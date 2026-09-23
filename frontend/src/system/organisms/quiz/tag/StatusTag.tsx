import CustomText from "../../../atoms/Text/CustomText";

export const QuizStatusTag = ({ status } : { status : string}) => {
	return (
		<CustomText
			weight="bold"
			textTag="h6"
			color={`${status === 'draft' ? 'primary' : 'success'}`}
			className={`p-2 rounded-sm shadow-sm ${status === 'draft' ? 'bg-disabled-light' : 'bg-success-light'}` }
		>
			{ status === 'draft' ? 'Brouillon' : 'Publié'}
		</CustomText>
	)
}

export const StatusTag = ({ status } : { status : string}) => {
	return (
		<CustomText
			weight="bold"
			textTag="h6"
			color={`${status === 'Actif' ? 'success' : 'error'}`}
			className={`p-2 rounded-sm shadow-sm ${status === 'Actif' ? 'bg-success-light' : 'bg-disabled-light'}` }
		>
			{status}
		</CustomText>
	)
}

export const UserRoleTag = ({ role } : { role : string}) => {

	let styling;

	switch (role) {
		case 'admin':
			styling = 'bg-error'
			break
		case 'formateur':
			styling = 'bg-success'
			break
		case 'apprenant':
			styling = 'bg-primary'
			break
		default:
			styling = 'bg-accent'
			break
	}

	return (
		<CustomText
			weight="bold"
			textTag="h6"
			color="white"
			className={`capitalize p-2 rounded-md shadow-sm ${styling}` }
		>
			{role}
		</CustomText>
	)
}