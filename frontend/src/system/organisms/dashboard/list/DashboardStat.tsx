import type { StatMetric } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import DashboardCard from "../container/DashboardCard"

interface DashboardStatProps {
	stats: StatMetric[]
}

export const DashboardStat = ({ stats } : DashboardStatProps) => {
	return (
		<Box className="w-full">
			{
				stats.map((stat, index) => {
					return (
						<DashboardCard 
							title={stat.label}
							value={stat.value}
							info={stat.change}
							key={'stat-' + index + stat.label}
						/>
					)
				}
				)
			}
		</Box>
	)
}