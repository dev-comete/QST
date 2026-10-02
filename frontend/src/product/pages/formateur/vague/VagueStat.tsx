import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import RankingCard from "../../../../system/organisms/dashboard/container/RankingCard";
import Box from "../../../../system/atoms/Container/Box";
import DashboardCard from "../../../../system/organisms/dashboard/container/DashboardCard";
import CustomText from "../../../../system/atoms/Text/CustomText";
// import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import Paper from "../../../../system/atoms/Container/Paper";
import VagueStatList from "../../../../system/organisms/vague/list/VagueStatList";

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
					<Paper className="p-5">
						<Box direction="column" className="w-full gap-3 mt-4">
							<CustomText textTag="h3" weight="bold" className="border-b border-background pb-2">
								Liste des évaluations
							</CustomText>
							<VagueStatList
								vagueList={statQuiz}
							/>
							{/* <div className="flex flex-col gap-3 w-1/2 m-auto">
								{statQuiz.map((quiz) => (
									<div 
										key={quiz.quiz_id} 
										className="p-4 flex flex-row items-center justify-between cursor-pointer hover:border-primary transition-all w-full group"
										onClick={() => setSelectedQuiz(quiz)}
									>
										<Box direction="column" className="items-center w-full">
											<CustomText weight="bold" className="group-hover:text-primary transition-colors">
												{quiz.quiz_titre}
											</CustomText>
											<CustomText className="text-sm opacity-75 mt-1">
												Moyenne : {quiz.moyenne_classe}/{quiz.points_maximum} • Réussite : {quiz.taux_reussite_pct}%
											</CustomText>
										</Box> */}
										{/* <Box className="items-center gap-2 text-primary opacity-80 group-hover:opacity-100 transition-opacity">
											<CustomText className="text-sm font-semibold hidden md:block">Voir les stats</CustomText>
											<FAIcon name="arrow-right" />
										</Box> */}
									{/* </div>
								))}
							</div> */}
						</Box>
                    </Paper>
                )}
            </Box>
        </BodyLayout>
    );
};

export default VagueStat;