import Paper from "../../atoms/Container/Paper";
import FAIcon from "../../atoms/Icon/FAIcon";
import CustomText from "../../atoms/Text/CustomText";

interface CardProps {
	title: string,
	icon?: string
	value: string | number,
	info?: string
}

const Card = ({ title, icon, value, info } : CardProps) => {
	return (
		<Paper className="flex flex-col space-y-2">
			{icon && <FAIcon name={icon}/>}
			<CustomText>{title}</CustomText>
			<CustomText textTag="h3">{value}</CustomText>
			{info && <CustomText>{info}</CustomText>}
		</Paper>
	)
}

export default Card;