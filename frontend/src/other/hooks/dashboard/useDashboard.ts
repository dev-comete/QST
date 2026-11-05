import { useQuery } from "@tanstack/react-query"
import { DashboardService } from "../../services/dashboardService"
import { TokenStorage } from "../../services/auth/storage";

export const useDashboard = () => {
	const token = TokenStorage.getAccessToken();
	
	const { data: metric, isPending : metricPending } = useQuery({
		queryKey: ['dashboard_metric'],
		queryFn: () => DashboardService.metric(),
		enabled: !!token,
	})

	return {
		metric,
		metricPending
	}
}