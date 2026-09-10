import { useQuery } from "@tanstack/react-query"
import { DashboardService } from "../../services/dashboardService"

export const useDashboard = () => {
	
	const { data: metric, isPending : metricPending } = useQuery({
		queryKey: ['dashboard_metric'],
		queryFn: () => DashboardService.metric(),
	})

	return {
		metric,
		metricPending
	}
}