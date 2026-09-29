import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import RankingCard from "../../../../system/organisms/dashboard/container/RankingCard";
import Box from "../../../../system/atoms/Container/Box";
import DashboardCard from "../../../../system/organisms/dashboard/container/DashboardCard";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Paper from "../../../../system/atoms/Container/Paper";

const VagueStat = () => {

	const { id } = useParams()

	const { data, isPending } = useVagueStat(id ?? '')

	if (isPending) return <Loading />

	if (!data) return <FetchError />

	const { 
		statistiques_globales : statGlobal,
		statistiques_par_quiz : statQuiz,
		vague
	} = data

	return (
        <BodyLayout
            title={`Statistiques - ${vague.vague_nom}`}
            defaultLinkBack
        >
            <Box direction="column" className="w-full gap-8 mt-4">
                
                {/* --- 📊 STATISTIQUES GLOBALES --- */}
                {
                    !statGlobal 
                    ? <CustomText>Veuillez inscrire des étudiants à la session</CustomText>
                    :   <Box className="flex flex-col md:flex-row gap-4 w-full">
                            <DashboardCard 
                                title="Taux de réussite globale"
                                value={statGlobal.taux_reussite_global_pct + '%'}
                            />
                            <DashboardCard 
                                title="Moyenne de la classe"
                                value={statGlobal.moyenne_globale_classe + '/' + statGlobal.points_totaux_possibles}
                                info={"Etudiants inscrits : " + vague.total_inscrits}
                            />
                        </Box>
                }

                {/* --- 🏆 CLASSEMENTS GLOBAUX --- */}
                {
                    !statQuiz || statQuiz.length === 0
                    ? <CustomText>Veuillez assigner des quiz à la session</CustomText>
                    : <Box className="flex flex-col md:flex-row gap-4 w-full">
                        <RankingCard
                            students={statGlobal?.majors_de_promo_top3 || []}
                        />
                        <RankingCard
                            students={statGlobal?.etudiants_en_difficulte_bottom3 || []}
                            variant="down"
                        />
                    </Box>
                }

                {/* --- 📝 STATISTIQUES PAR QUIZ --- */}
                {statQuiz && statQuiz.length > 0 && (
                    <Box direction="column" className="w-full gap-4 mt-4">
                        <CustomText textTag="h5" weight="bold" className="border-b border-background pb-2">
                            Détails des évaluations
                        </CustomText>
                        
                        {/* Grille responsive : 1 colonne sur mobile, 2 sur écrans larges */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                            {statQuiz.map((quiz) => (
                                <Paper key={quiz.quiz_id} className="p-4 flex flex-col gap-4">
                                    {/* Titre du quiz */}
                                    <CustomText textTag="h6" weight="bold" className="text-primary">
                                        {quiz.quiz_titre}
                                    </CustomText>

                                    {/* Mini-stats du quiz */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <DashboardCard 
                                            title="Réussite" 
                                            value={`${quiz.taux_reussite_pct}%`} 
                                        />
                                        <DashboardCard 
                                            title="Moyenne" 
                                            value={`${quiz.moyenne_classe}/${quiz.points_maximum}`} 
                                            info={`Participation: ${quiz.taux_participation_pct}%`}
                                        />
                                    </div>

                                    {/* Alerte Question Difficile */}
                                    {quiz.alerte_question_difficile && (
                                        <Box direction="column" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg w-full">
                                            <CustomText weight="bold" className="text-red-600 dark:text-red-400 text-sm">
                                                ⚠️ Point de blocage ({quiz.nombre_echecs_question} échecs)
                                            </CustomText>
                                            <CustomText className="text-xs mt-1 italic text-text">
                                                "{quiz.alerte_question_difficile}"
                                            </CustomText>
                                        </Box>
                                    )}

                                    {/* Top 3 du Quiz - On "Mappe" les données pour correspondre à RankingCard */}
                                    <Box className="mt-2 w-full">
                                        <RankingCard
                                            students={quiz.top_3.map(student => ({
                                                // Conversion à la volée pour tromper RankingCard
                                                utilisateur__username: student.username,
                                                score_cumule: student.score
                                            }))}
                                        />
                                    </Box>
                                </Paper>
                            ))}
                        </div>
                    </Box>
                )}
                
            </Box>
        </BodyLayout>
    )
}

export default VagueStat;