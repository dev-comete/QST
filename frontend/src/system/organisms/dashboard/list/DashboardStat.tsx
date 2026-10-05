import type { ColorTheme } from "../../../../other/types/common"
import type { StatMetric } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import DashboardCard from "../container/DashboardCard"

interface DashboardStatProps {
	stats: StatMetric[]
}

interface DashboardMetricItem {
	icon: string,
	color: ColorTheme
}

const DashboardMetricIcon : DashboardMetricItem[] = [
	{ icon: 'book', color: 'warning'},
	{ icon: 'users', color: 'success'},
	{ icon: 'file-circle-question', color: 'text'},
	{ icon: 'circle-question', color: 'error'},
	{ icon: 'star', color: 'primary'},
]

export const DashboardStat = ({ stats } : DashboardStatProps) => {
	return (
		<Box className="w-full flex-wrap">
			{
				stats.map((stat, index) => {
					return (
						<DashboardCard 
							title={stat.label}
							value={stat.value}
							info={stat.change}
							icon={DashboardMetricIcon[index].icon}
							color={DashboardMetricIcon[index].color}
							key={'stat-' + index + stat.label}
							variant="lg"
						/>
					)
				}
				)
			}
		</Box>
	)
}