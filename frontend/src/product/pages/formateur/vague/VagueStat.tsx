import { useState } from "react";
import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import RankingCard from "../../../../system/organisms/dashboard/container/RankingCard";
import Box from "../../../../system/atoms/Container/Box";
import DashboardCard from "../../../../system/organisms/dashboard/container/DashboardCard";
import CustomText from "../../../../system/atoms/Text/CustomText";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import type { vagueStatQuiz } from "../../../../other/types/vagueType";
import { Modal } from "../../../../system/molecules/Modal/Modal";

const VagueStat = () => {

	const { id } = useParams()

	const { data, isPending } = useVagueStat(id ?? '')

	const [selectedQuiz, setSelectedQuiz] = useState<vagueStatQuiz | null>(null);

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
                {!statGlobal ? (
                    <CustomText>Veuillez inscrire des étudiants à la session</CustomText>
                ) : (
                    <Box className="flex flex-col md:flex-row gap-4 w-full">
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
                )}

                {/* --- 🏆 CLASSEMENTS GLOBAUX --- */}
                {!statQuiz || statQuiz.length === 0 ? (
                    <CustomText>Veuillez assigner des quiz à la session</CustomText>
                ) : (
                    <Box className="flex flex-col md:flex-row gap-4 w-full">
                        <RankingCard students={statGlobal?.majors_de_promo_top3 || []} />
                        <RankingCard students={statGlobal?.etudiants_en_difficulte_bottom3 || []} variant="down" />
                    </Box>
                )}

                {/* --- 📝 LISTE SIMPLE DES QUIZ --- */}
                {statQuiz && statQuiz.length > 0 && (
                    <Box direction="column" className="w-full gap-3 mt-4">
                        <CustomText textTag="h5" weight="bold" className="border-b border-background pb-2">
                            Liste des évaluations
                        </CustomText>
                        
                        <div className="flex flex-col gap-3 w-full">
                            {statQuiz.map((quiz) => (
                                <div 
                                    key={quiz.quiz_id} 
                                    className="p-4 flex flex-row items-center justify-between cursor-pointer hover:border-primary transition-all w-full group"
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    <Box direction="column">
                                        <CustomText weight="bold" textTag="h6" className="group-hover:text-primary transition-colors">
                                            {quiz.quiz_titre}
                                        </CustomText>
                                        <CustomText className="text-sm opacity-75 mt-1">
                                            Moyenne : {quiz.moyenne_classe}/{quiz.points_maximum} • Réussite : {quiz.taux_reussite_pct}%
                                        </CustomText>
                                    </Box>
                                    <Box className="items-center gap-2 text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                                        <CustomText className="text-sm font-semibold hidden md:block">Voir les stats</CustomText>
                                        <FAIcon name="arrow-right" />
                                    </Box>
                                </div>
                            ))}
                        </div>
                    </Box>
                )}
            </Box>

            {/* --- 🪟 MODALE DES DÉTAILS DU QUIZ (UTILISATION DE VOTRE COMPOSANT) --- */}
            <Modal
                isOpen={!!selectedQuiz} // true si un quiz est sélectionné
                closeModal={() => setSelectedQuiz(null)}
                title={selectedQuiz?.quiz_titre} // Le titre est géré nativement par la Modal
            >
                {selectedQuiz && (
                    <div className="flex flex-col gap-6 w-full pt-2">
                        
                        {/* Alerte Question Difficile */}
                        {selectedQuiz.alerte_question_difficile && (
                            <Box direction="column" className="bg-red-50 border border-red-200 p-4 rounded-lg w-full">
                                <CustomText weight="bold" className="text-red-600">
                                    ⚠️ Point de blocage repéré ({selectedQuiz.nombre_echecs_question} échecs)
                                </CustomText>
                                <CustomText className="text-sm mt-2 italic text-slate-700">
                                    "{selectedQuiz.alerte_question_difficile}"
                                </CustomText>
                            </Box>
                        )}

                        {/* Mini-stats du quiz */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DashboardCard 
                                title="Taux de réussite" 
                                value={`${selectedQuiz.taux_reussite_pct}%`} 
                            />
                            <DashboardCard 
                                title="Moyenne" 
                                value={`${selectedQuiz.moyenne_classe}/${selectedQuiz.points_maximum}`} 
                                info={`Participation : ${selectedQuiz.taux_participation_pct}%`}
                            />
                        </div>

                        {/* Classements spécifiques à ce Quiz */}
                        <Box className="flex flex-col md:flex-row gap-4 w-full">
                            <RankingCard
                                students={selectedQuiz.top_3.map(student => ({
                                    utilisateur__username: student.username,
                                    score_cumule: student.score
                                }))}
                            />
                            <RankingCard
                                variant="down"
                                students={selectedQuiz.bottom_3.map(student => ({
                                    utilisateur__username: student.username,
                                    score_cumule: student.score
                                }))}
                            />
                        </Box>

                    </div>
                )}
            </Modal>
        </BodyLayout>
    );
};

export default VagueStat;