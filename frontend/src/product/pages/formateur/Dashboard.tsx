import { useDashboard } from "../../../other/hooks/dashboard/useDashboard"
import Box from "../../../system/atoms/Container/Box"
import FetchError from "../../../system/atoms/Loading/FetchError"
import Loading from "../../../system/atoms/Loading/Loading"
import DashboardBloc from "../../../system/organisms/dashboard/container/DashboardBloc"
import { RecentQuizItem, SessionsItem } from "../../../system/organisms/dashboard/container/DashboardItems"
import { DashboardStat } from "../../../system/organisms/dashboard/container/DashboardStat"
import BodyLayout from "../../layout/common/BodyLayout"

const Dashboard = () => {
	const { metric, metricPending } = useDashboard()

	if (metricPending) return <Loading />

	if (!metric) return <FetchError />

    return (
		<BodyLayout
			title="Tableau de bord"
		>
			<DashboardStat stats={metric.stats}/>
			<Box>
				<DashboardBloc 
					title="Suivi des quiz récents"
					emptyText="Il n'y a pas encore de quiz publié"
					data={metric.recentQuizzes}
					Item={RecentQuizItem}
				/>
				<DashboardBloc 
					title="Prochaines sessions"
					emptyText="Il n'y a pas encore de session plannifié"
					data={metric.upcomingSessions}
					Item={SessionsItem}
				/>
			</Box>
		</BodyLayout>
    )
}

export default Dashboard;