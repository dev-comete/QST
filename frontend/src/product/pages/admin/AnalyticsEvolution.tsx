import React from 'react';
import { useParams } from 'react-router';
import BodyLayout from '../../layout/common/BodyLayout';
import Box from '../../../system/atoms/Container/Box';
import FetchError from '../../../system/atoms/Loading/FetchError';
import Loading from '../../../system/atoms/Loading/Loading';
import StatCard from '../../../system/molecules/StatCard/StatCard';
import EvolutionChart from '../../../system/organisms/EvolutionChart/EvolutionChart';
import { useVagueAnalytics } from '../../../other/hooks/analytics/useAnalytics';

export const AnalyticsEvolution: React.FC = () => {
    const { vagueId: vagueIdParam } = useParams<{ vagueId: string }>();
    const vagueId = Number(vagueIdParam ?? 13);

    const { data: dashboardData, isLoading, error } = useVagueAnalytics(vagueId);

    if (isLoading) {
        return <Loading message="Chargement de l'analytique..." />;
    }

    if (error) {
        return <FetchError />;
    }

    if (!dashboardData || !dashboardData.vague) {
        return (
            <BodyLayout title="Analytique">
                <Box className="w-full justify-center p-5">
                    Aucune donnée trouvée.
                </Box>
            </BodyLayout>
        );
    }

    const nomVague = dashboardData.vague.vague_nom || 'Session';
    const etudiants = dashboardData.etudiants_inscrits || [];

    const kpis = dashboardData.statistiques_globales
        ? [
            {
                label: 'Moyenne Globale',
                value: `${dashboardData.statistiques_globales?.moyenne_globale_classe ?? 0}%`,
                change: 'Classe',
                tone: 'primary',
                link: null,
            },
            {
                label: 'Taux de réussite',
                value: `${dashboardData.statistiques_globales?.taux_reussite_global_pct ?? 0}%`,
                change: '> 50%',
                tone: 'success',
                link: null,
            },
            {
                label: 'Points Possibles',
                value: String(dashboardData.statistiques_globales?.points_totaux_possibles ?? 0),
                change: 'Total',
                tone: 'secondary',
                link: null,
            },
        ]
        : [];

    return (
        <BodyLayout
            title="Analytique"
            subtitle={<span>Session : {nomVague}</span>}
        >
            <Box direction="column" className="w-full gap-6">
                <Box direction="row" className="w-full flex-wrap gap-4">
                    {kpis.map((stat: any, index: number) => (
                        <StatCard key={`${stat.label}-${index}`} stat={stat} />
                    ))}
                </Box>

                <EvolutionChart vagueId={vagueId} etudiantsDisponibles={etudiants} />
            </Box>
        </BodyLayout>
    );
};