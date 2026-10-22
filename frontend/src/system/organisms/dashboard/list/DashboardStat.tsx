import type { ColorTheme } from "../../../../other/types/common"
import type { StatMetric } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import DashboardCard from "../container/DashboardCard"

interface DashboardStatProps {
	stats: StatMetric[]
	type: 'admin' | 'formateur'
}

interface DashboardMetricItem {
	icon: string,
	color: ColorTheme
	link?: string
}

const getDashboardMetricIcons = (type: 'admin' | 'formateur') => {
	const DashboardMetricIcon : DashboardMetricItem[] = [
		{ icon: 'book', color: 'warning', link: type == 'admin' ? 'parametre_general?tab=3' : 'formation'},
		{ icon: 'users', color: 'success', link: 'gestion_equipe'},
		{ icon: 'file-circle-question', color: 'text', link: 'gestion_quiz'},
		{ icon: 'circle-question', color: 'error', link: 'gestion_question'},
		{ icon: 'star', color: 'primary'},
	]
	return (
		DashboardMetricIcon
	)
}

export const DashboardStat = ({ stats, type } : DashboardStatProps) => {

	const dashboardStyle = getDashboardMetricIcons(type)

	return (
		<Box className="w-full flex-wrap">
			{
				stats.map((stat, index) => {
					return (
						<div 
                key={'stat-' + index + stat.label}
                className="w-full flex-1 min-w-[100x] min-h-[100px]"
            >
				<DashboardCard 
					title={stat.label == 'Vagues' ? 'Equipes' : stat.label}
					value={stat.value}
					info={stat.change}
					icon={dashboardStyle[index].icon}
					color={dashboardStyle[index].color}
					key={'stat-' + index + stat.label}
					variant="lg"
					link={dashboardStyle[index].link}
				/>

			</div>
					)
				}
				)
			}
		</Box>
	)
}