import CustomText from "../../atoms/Text/CustomText";

const Title = ({ title } : { title : string}) => {
	return (
		<>
			<CustomText textTag="h2">{title}</CustomText>
		</>
	)
}

export default Title;