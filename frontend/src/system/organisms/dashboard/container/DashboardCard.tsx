import Paper from "../../../atoms/Container/Paper";
import FAIcon from "../../../atoms/Icon/FAIcon";
import CustomText from "../../../atoms/Text/CustomText";

interface CardProps {
	title: string,
	icon?: string
	value: string | number,
	info?: string
}

const DashboardCard = ({ title, icon, value, info } : CardProps) => {
	return (
		<Paper className="flex flex-col space-y-2 items-center justify-center p-3 flex-1 min-w-0 h-40">
			{icon && <FAIcon name={icon}/>}
			<CustomText textTag="h6">{title}</CustomText>
			<CustomText textTag="h1" weight="bold" color="primary">{value}</CustomText>
			{info && <CustomText textTag="h6">{info}</CustomText>}
		</Paper>
	)
}

export default DashboardCard;