import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import RankingCard from "../../../../system/organisms/dashboard/container/RankingCard";
import Box from "../../../../system/atoms/Container/Box";
import DashboardCard from "../../../../system/organisms/dashboard/container/DashboardCard";
import CustomText from "../../../../system/atoms/Text/CustomText";

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
			{
				!statGlobal 
				? <CustomText>Veuillez inscrire des étudiants à la session</CustomText>
				:	<Box>
						<DashboardCard 
							title="Taux de réussite globale"
							value={statGlobal.taux_reussite_global_pct + '%'}
						/>
						<DashboardCard 
							title="Moyenne de la classe"
							value={statGlobal.moyenne_globale_classe + '/' + statGlobal.points_totaux_possibles}
							info={"Etudiants inscrits :" + vague.total_inscrits}
						/>
					</Box>
			}
			{
				!statQuiz 
				? <CustomText>Veuillez assigner des quiz à la session</CustomText>
				: <Box className="w-full">
					<RankingCard
						students={statGlobal.majors_de_promo_top3}
					/>
					<RankingCard
						students={statGlobal.etudiants_en_difficulte_bottom3}
						variant="down"
					/>
				</Box>
			}
		</BodyLayout>
	)
}

export default VagueStat;