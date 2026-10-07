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
		<Paper
			onClick={() => link && navigateTo(link)}
			className={`
				flex flex-col space-y-2 items-start justify-center flex-1 p-3 md:p-5
				w-full min-w-0 h-full
				transition-all duration-200
				${link ? 'cursor-pointer hover:-translate-y-1.5' : ''}
			`}
		>

		<Box className="items-center gap-2">
			{icon && (
				<FAIcon 
					name={icon} 
					size="sm" 
					className={`text-${color} border border-background p-2 sm:p-3 rounded-xl shrink-0`}
				/>
			)}
			<CustomText 
				textTag={textTag} 
				className="text-sm leading-snug line-clamp-2"
			>
				{title}
			</CustomText>
		</Box>

		<Box direction={infoDirection} className="flex-wrap items-baseline gap-2 w-full">
			<CustomText 
				textTag="h1" 
				weight="bold" 
				color={color} 
				className={`${valueTextSize || 'text-lg sm:text-xl md:text-2xl'} tracking-tight shrink-0`}
			>
				{padZero(value)}
			</CustomText>
			{info && (
				<CustomText 
					textTag={textTag} 
					className="text-xs text-gray-500 line-clamp-1"
				>
					{info}
				</CustomText>
			)}
		</Box>
	</Paper>
	)
}

export default DashboardCard;