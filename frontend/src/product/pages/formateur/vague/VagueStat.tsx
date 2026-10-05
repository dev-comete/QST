import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import RankingCard from "../../../../system/organisms/dashboard/container/RankingCard";
import Box from "../../../../system/atoms/Container/Box";
import DashboardCard from "../../../../system/organisms/dashboard/container/DashboardCard";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Paper from "../../../../system/atoms/Container/Paper";
import VagueStatList from "../../../../system/organisms/vague/list/VagueStatList";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import { useTabNavigation } from "../../../../other/hooks/navigation/useTabNavigation";

interface VagueStatProps {
	vagueId: string
}

const VagueStat = ({ vagueId } : VagueStatProps) => {

	const { data, isPending } = useVagueStat(vagueId)
	const { activeTab, handleTabChange } = useTabNavigation({paramName: 'Statistique'})

	if (isPending) return <Loading />

	if (!data) return <FetchError />

	const { 
		statistiques_globales : statGlobal,
		statistiques_par_quiz : statQuiz,
	} = data

	if (!statGlobal || ! statQuiz) return null

	const getColorScore = (val: number) => {
		if (val >= 80) return 'success';
		if (val >= 50) return 'warning';
		return 'error';
	};

	return (
		<NavigationBar
			titles={['Résultat', 'Classement', 'Evaluations']}
			activeTab={activeTab}
			onTabChange={handleTabChange}
		>
			<Box className="w-full">
				<DashboardCard 
					title="Taux de réussite globale"
					icon="star"
					variant="lg"
					color={getColorScore(statGlobal.taux_reussite_global_pct)}
					value={statGlobal.taux_reussite_global_pct + '%'}
				/>
				<DashboardCard 
					title="Moyenne de la classe"
					icon="star"
					variant="lg"
					color="primary"
					value={statGlobal.moyenne_globale_classe + '/' + statGlobal.points_totaux_possibles}
					info={"points"}
				/>
			</Box>
			<Box className="flex flex-col gap-4 w-full">
				<RankingCard students={statGlobal?.majors_de_promo_top3 || []} />
				<RankingCard students={statGlobal?.etudiants_en_difficulte_bottom3 || []} variant="down" />
			</Box>
			<VagueStatList vagueList={statQuiz}/>
		</NavigationBar>
    );
};

export default VagueStat;