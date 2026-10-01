import type { EvolutionChartResponse, VagueAnalyticsResponse } from "../types/analyticsType";
import apiClient from "./apiClient";

const ANALYTICS_URL = import.meta.env.VITE_VAGUE_ANALYTICS || '/quizzes/analytics/vague/#vague_id/';
const CHART_EVOLUTION_URL = import.meta.env.VITE_VAGUE_CHART_EVOLUTION || '/quizzes/vagues/#vague_id/chart-evolution/';

const buildUrlWithVagueId = (baseUrl: string, vagueId: number) => baseUrl.replace('#vague_id', String(vagueId));

export const AnalyticsService = {
    analytics: async (vagueId: number) => {
        const response = await apiClient.get(buildUrlWithVagueId(ANALYTICS_URL, vagueId));
        return response.data as VagueAnalyticsResponse;
    },

    chartEvolution: async (vagueId: number, selectedStudentIds: number[] = []) => {
        const params = selectedStudentIds.length > 0 ? `?etudiants=${selectedStudentIds.join(',')}` : '';
        const response = await apiClient.get(`${buildUrlWithVagueId(CHART_EVOLUTION_URL, vagueId)}${params}`);
        return response.data as EvolutionChartResponse;
    },
};
