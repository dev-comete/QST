import { padZero } from "../../../../other/helper/helper";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import type { ColorTheme } from "../../../../other/types/common";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import FAIcon from "../../../atoms/Icon/FAIcon";
import CustomText from "../../../atoms/Text/CustomText";

export interface CardProps {
	title: string
	icon?: string
	value: string | number
	info?: string
	infoDirection?: 'column' | 'row'
	variant?: 'lg' | 'sm'
	color?: ColorTheme
	link?: string
}

const DashboardCard = ({ 
	title,
	icon,
	value,
	info,
	variant = 'sm',
	color,
	infoDirection = 'row',
	link
} : CardProps) => {

	const textTag = variant == 'sm' ? 'h6' : 'h4'
	const valueTextSize = variant == 'sm' ? '' : 'text-[35px]'

	const { navigateTo } = useAppNavigation()

	return (
		<Paper className={`
			flex flex-col space-y-2 items-start justify-center flex-1 p-5
			w-full min-w-0 min-h-35 sm:min-h-40'}
			transition-all duration-200
			${link && 'cursor-pointer hover:-translate-y-1.5'}
		`}>
			<div onClick={() => link && navigateTo(link)}>
				<Box className="items-center">
					{icon && <FAIcon name={icon} size='sm' className={`text-${color} border border-background p-3 rounded-xl`}/>}
					<CustomText textTag={textTag}>{title}</CustomText>
				</Box>
				<Box direction={infoDirection} className="items-center">
					<CustomText textTag="h1" weight="bold" color={color} className={valueTextSize}>{padZero(value)}</CustomText>
					{info && <CustomText textTag={textTag}>{info}</CustomText>}
				</Box>
			</div>
		</Paper>
	)
}

export default DashboardCard;