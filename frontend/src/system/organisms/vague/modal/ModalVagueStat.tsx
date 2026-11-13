// frontend/src/system/organisms/vague/modal/ModalVagueStat.tsx
import type { Dispatch, SetStateAction } from "react"
import type { vagueStatQuiz } from "../../../../other/types/vagueType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"
import { Modal } from "../../../molecules/Modal/Modal"
import DashboardCard from "../../dashboard/container/DashboardCard"
import RankingCard from "../../dashboard/container/RankingCard"
import FAIcon from "../../../atoms/Icon/FAIcon" 

interface ModalVagueStatProps {
    selectedQuiz: vagueStatQuiz | null
    setSelectedQuiz: Dispatch<SetStateAction<vagueStatQuiz | null>>
}

/* ==========================================
   ANCIEN CODE : ModalVagueStat
   ==========================================
const ModalVagueStat = ({ selectedQuiz, setSelectedQuiz } : ModalVagueStatProps) => {
    return (
        <Modal 
            isOpen={!!selectedQuiz} // true si un quiz est sélectionné
            closeModal={() => setSelectedQuiz(null)}
            title={selectedQuiz?.quiz_titre} // Le titre est géré nativement par la Modal
        >
            {selectedQuiz && (
                <div className="flex flex-col gap-6 w-full pt-2">
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
*/

// NOUVEAU CODE : ModalVagueStat (Meilleure responsivité, padding, et icones UX)
const ModalVagueStat = ({ selectedQuiz, setSelectedQuiz } : ModalVagueStatProps) => {
    return (
        <Modal 
            isOpen={!!selectedQuiz}
            closeModal={() => setSelectedQuiz(null)}
            title={selectedQuiz?.quiz_titre} 
        >
            {selectedQuiz && (
                <div className="flex flex-col gap-6 w-full">
                    
                    {/* Alerte Question Difficile plus professionnelle */}
                    {selectedQuiz.alerte_question_difficile && (
                        <Box className="bg-red-50/80 border-l-4 border-red-500 p-4 rounded-r-lg w-full items-start gap-3 shadow-sm">
                             <FAIcon name="triangle-exclamation" className="text-red-500 mt-1" size="lg" />
                             <Box direction="column" className="gap-1 flex-1">
                                <CustomText weight="bold" className="text-red-700">
                                    Point d'attention pédagogique ({selectedQuiz.nombre_echecs_question} échecs)
                                </CustomText>
                                <CustomText className="text-sm italic text-red-900/80">
                                    "{selectedQuiz.alerte_question_difficile}"
                                </CustomText>
                             </Box>
                        </Box>
                    )}

                    {/* Mini-stats du quiz adaptées mobile et desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DashboardCard 
                            title="Taux de réussite" 
                            value={`${selectedQuiz.taux_reussite_pct}%`} 
                            icon="chart-pie"
                            color={selectedQuiz.taux_reussite_pct >= 50 ? 'success' : 'warning'}
                        />
                        <DashboardCard 
                            title="Moyenne de la classe" 
                            value={`${selectedQuiz.moyenne_classe}/${selectedQuiz.points_maximum}`} 
                            info={`Participation : ${selectedQuiz.taux_participation_pct}%`}
                            icon="bullseye"
                            color="primary"
                        />
                    </div>

                    {/* Classements spécifiques à ce Quiz */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <RankingCard 
                            variant="top"
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
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default ModalVagueStat;