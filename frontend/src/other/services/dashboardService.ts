import type { DashboardMetric } from "../types/dashboardType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const METRIC_URL = ENDPOINTS.DASHBOARD.METRICS

export const DashboardService = {

	metric : async () => {
		const response = await apiClient.get(METRIC_URL);
		return response.data as DashboardMetric;
	}

}