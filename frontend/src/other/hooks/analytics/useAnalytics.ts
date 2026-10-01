import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '../../services/analyticsService';

export const useVagueAnalytics = (vagueId?: number) => {
    return useQuery({
        queryKey: ['vague_analytics', vagueId],
        queryFn: () => {
            if (typeof vagueId !== 'number' || vagueId <= 0) {
                throw new Error('A valid vague ID is required.');
            }

            return AnalyticsService.analytics(vagueId);
        },
        enabled: typeof vagueId === 'number' && vagueId > 0,
    });
};

export const useEvolutionChart = (vagueId?: number, selectedStudentIds: number[] = []) => {
    return useQuery({
        queryKey: ['vague_chart_evolution', vagueId, selectedStudentIds.join(',')],
        queryFn: () => {
            if (typeof vagueId !== 'number' || vagueId <= 0) {
                throw new Error('A valid vague ID is required.');
            }

            return AnalyticsService.chartEvolution(vagueId, selectedStudentIds);
        },
        enabled: typeof vagueId === 'number' && vagueId > 0,
    });
};
