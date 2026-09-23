import type { DashboardMetric } from "../types/dashboardType";
import apiClient from "./apiClient";

const METRIC_URL = import.meta.env.VITE_DASHBOARD_METRIC

export const DashboardService = {

	metric : async () => {
		const response = await apiClient.get(METRIC_URL);
		return response.data as DashboardMetric;
	}

}