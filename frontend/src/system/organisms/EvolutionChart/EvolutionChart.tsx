import React, { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEvolutionChart } from '../../../other/hooks/analytics/useAnalytics';
import Box from '../../atoms/Container/Box';
import Paper from '../../atoms/Container/Paper';
import CustomText from '../../atoms/Text/CustomText';

interface EvolutionChartProps {
    vagueId: number;
    etudiantsDisponibles: { id: number; username: string }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const EvolutionChart: React.FC<EvolutionChartProps> = ({ vagueId, etudiantsDisponibles }) => {
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    const { data, isLoading } = useEvolutionChart(vagueId, selectedStudentIds);

    if (isLoading) {
        return (
            <Paper className="w-full p-6">
                <CustomText textTag="h4" weight="bold" color="primary">Chargement du graphique...</CustomText>
            </Paper>
        );
    }

    if (!data) {
        return (
            <Paper className="w-full p-6">
                <CustomText textTag="h4" weight="bold" color="primary">Aucune donnée disponible.</CustomText>
            </Paper>
        );
    }

    const linesToDraw = Object.keys(data.legendes ?? {});

    return (
        <Paper className="w-full h-[500px] p-6" hasShadow>
            <Box direction="row" className="mb-5 items-center justify-between gap-4">
                <CustomText textTag="h2" weight="bold" color="primary">Progression de la classe</CustomText>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        className="self-end rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        onClick={() => setSelectedStudentIds(etudiantsDisponibles.map((etudiant) => etudiant.id))}
                    >
                        Sélectionner tout
                    </button>

                    <select
                        multiple
                        size={Math.min(6, Math.max(3, etudiantsDisponibles.length || 3))}
                        className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        value={selectedStudentIds.map(String)}
                        onChange={(event) => {
                            const nextValues = Array.from(event.target.selectedOptions, (option) => Number(option.value));
                            setSelectedStudentIds(nextValues);
                        }}
                    >
                        {etudiantsDisponibles.map((etudiant) => (
                            <option key={etudiant.id} value={etudiant.id}>
                                {etudiant.username}
                            </option>
                        ))}
                    </select>
                </div>
            </Box>

            <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quiz_titre" />
                        <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend formatter={(value) => data.legendes[value]} />

                        {linesToDraw.map((lineKey, index) => (
                            <Line
                                key={lineKey}
                                type="monotone"
                                dataKey={lineKey}
                                stroke={lineKey === 'moyenne_classe' ? '#cbd5e1' : COLORS[index % COLORS.length]}
                                strokeWidth={lineKey === 'moyenne_classe' ? 3 : 2}
                                strokeDasharray={lineKey === 'moyenne_classe' ? '5 5' : '0'}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
};

export default EvolutionChart;