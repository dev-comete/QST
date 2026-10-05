import Paper from "../../../atoms/Container/Paper";
import FAIcon from "../../../atoms/Icon/FAIcon";
import CustomText from "../../../atoms/Text/CustomText";

interface CardProps {
	title: string,
	icon?: string
	value: string | number,
	info?: string
	variant?: 'lg' | 'sm'
}

const DashboardCard = ({ title, icon, value, info, variant = 'sm' } : CardProps) => {

	const textTag = variant == 'sm' ? 'h6' : 'h4'

	return (
		<Paper className={`
			flex flex-col space-y-2 items-center justify-center p-3 sm:p-4 flex-1
			w-full min-w-0 ${variant === 'sm' ? 'min-h-32 sm:min-h-40' : 'min-h-64 sm:min-h-80'}
			transition-all duration-200
		`}>
			{icon && <FAIcon name={icon} size={`${variant == 'sm' ? 'sm' : 'xl'}`}/>}
			<CustomText textTag={textTag}>{title}</CustomText>
			<CustomText textTag="h1" weight="bold" color="primary">{value}</CustomText>
			{info && <CustomText textTag={textTag}>{info}</CustomText>}
		</Paper>
	)
}

export default DashboardCard;