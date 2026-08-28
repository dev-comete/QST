import apiClient from './client';

export const DashboardService = {
  getMetrics: async () => {
    const response = await apiClient.get('/quizzes/dashboard/metrics/');
    return response.data;
  }
};