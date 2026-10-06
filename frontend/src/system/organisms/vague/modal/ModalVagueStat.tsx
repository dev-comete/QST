import type { Dispatch, SetStateAction } from "react"
import type { vagueStatQuiz } from "../../../../other/types/vagueType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"
import { Modal } from "../../../molecules/Modal/Modal"
import DashboardCard from "../../dashboard/container/DashboardCard"
import RankingCard from "../../dashboard/container/RankingCard"

interface ModalVagueStatProps {
	selectedQuiz: vagueStatQuiz
	setSelectedQuiz: Dispatch<SetStateAction<vagueStatQuiz | null>>
}

const ModalVagueStat = ({ selectedQuiz, setSelectedQuiz } : ModalVagueStatProps) => {
	return (
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
	)
}

export default ModalVagueStat;