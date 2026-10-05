import { useAssignVague } from "../../../../other/hooks/vague/useAssignVague";
import Box from "../../../../system/atoms/Container/Box";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import { StudentAssignation } from "./StudentAssignation";
import QuizAssignation from "./QuizAssignation";
import { useVague } from "../../../../other/hooks/vague/useVague";
import { useParams } from "react-router";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useTabNavigation } from "../../../../other/hooks/navigation/useTabNavigation";
import VagueStat from "./VagueStat";
import type { CardProps } from "../../../../system/organisms/dashboard/container/DashboardCard";
import type { vagueType } from "../../../../other/types/vagueType";
import { formatDate } from "../../../../other/helper/helper";
import { QuizQuestionCard } from "../quizz/QuizQuestion";
import Paper from "../../../../system/atoms/Container/Paper";

interface VagueAssignProps {
	vague: vagueType
}

const VagueInfo = ({ vague } : VagueAssignProps) => {

	const {
		debut,
		fin,
		formation_nom,
		etudiants: ownedStudents,
		quizzes_assignes: ownedQuiz 
	} = vague

	const vagueInfoDetail : CardProps[] = [
		{
			title: 'Début',
			value:formatDate(debut),
			icon: 'calendar',
			// color: 'primary',
		},
		{
			title: 'Fin',
			value:formatDate(fin),
			icon: 'calendar',
			// color: 'error',
		},
		{
			title: 'Formation',
			value: formation_nom,
			icon: 'book',
			// color: 'text',
		},
		{
			title: 'Quiz',
			value: ownedQuiz.length,
			info: 'assignés',
			icon: 'file-circle-question',
			// color: 'warning',
		},
		{
			title: 'Etudiants',
			value: ownedStudents.length,
			info: 'inscrits',
			icon: 'user',
			// color: 'success',
		},

	]

	return (
		<Paper className="p-3">
			<Box className="w-full flex-wrap justify-between">
			{
				vagueInfoDetail.map((stat, index) => {
					return (
						<QuizQuestionCard 
							title={stat.title}
							value={stat.value}
							icon={stat.icon}
							color={stat.color}
							key={'stat-' + index + stat.title}
						/>
					)
				}
				)
			}
			</Box>
		</Paper>
	)
}

const VagueAssign = () => {

	const { getAllVague } = useVague({})
	const { data: vagues, status } = getAllVague
	const { id } = useParams()
	const { activeTab, handleTabChange } = useTabNavigation();

	const { 
		quiz, setQuiz, isAssignQuizPending, handleAssignQuiz,
		students, setStudents, isAssignStudPending, handleAssignStudent
	} = useAssignVague(Number(id))

	if (status == 'pending')
		return <Loading />
	
	if (!vagues)
		return <FetchError />

	const vague = vagues.find((v) => v.id == Number(id))

	if (!vague)
		return <FetchError />

	const { 
		etudiants: ownedStudents,
		quizzes_assignes: ownedQuiz,
	} = vague

	return (
		<BodyLayout
			title={vague.nom_vague}
			defaultLinkBack
		>
			<Box direction="column" className="space-y-5 w-full">
				<NavigationBar
					titles={['Statistique', 'Quiz', 'Inscription']}	
					activeTab={activeTab}
					onTabChange={handleTabChange}			
				>
					<Box direction="column">
						<VagueInfo vague={vague} />
						<VagueStat vagueId={String(id)} />
					</Box>
					<QuizAssignation 
						quiz={quiz}
						setQuiz={setQuiz}
						handleAssignQuiz={handleAssignQuiz}
						isPending={isAssignQuizPending}
						ownedQuiz={ownedQuiz}
						formationId={vague.formation_id}
					/>
					<StudentAssignation 
						ownedStudents={ownedStudents}
						students={students}
						setStudents={setStudents}
						handleAssignStudent={handleAssignStudent}
						isPending={isAssignStudPending}
					/>
				</NavigationBar>
			</Box>
		</BodyLayout>
	)
}

export default VagueAssign;