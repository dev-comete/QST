export interface StatItem {
    label: string;
    value: string;
    change: string;
    tone: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
    link: string | null;
}

export interface ChartDataPoint {
    quiz_id: number;
    quiz_titre: string;
    moyenne_classe: number;
    [key: string]: any; // Permet d'accepter les clés dynamiques comme 'etudiant_5'
}

export interface VagueAnalyticsResponse {
    vague?: {
        vague_nom?: string;
        id?: number;
        [key: string]: any;
    };
    etudiants_inscrits?: Array<{ id: number; username: string; [key: string]: any }>;
    statistiques_globales?: {
        moyenne_globale_classe?: number;
        taux_reussite_global_pct?: number;
        points_totaux_possibles?: number;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface EvolutionChartResponse {
    legendes: Record<string, string>;
    chart_data: ChartDataPoint[];
}