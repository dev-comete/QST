import { useAssignVague } from "../../../../other/hooks/vague/useAssignVague";
import type { vagueType } from "../../../../other/types/vagueType";
import Box from "../../../../system/atoms/Container/Box";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import { StudentAssignation } from "./StudentAssignation";
import QuizAssignation from "./QuizAssignation";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import { formatDate } from "../../../../other/helper/helper";
import { useVague } from "../../../../other/hooks/vague/useVague";
import { useParams } from "react-router";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import BodyLayout from "../../../layout/common/BodyLayout";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";

const HeaderBloc = ({ title, content, icon } : { title: string, content : string | number, icon: string}) => {
	return (
		<Box className="border border-background px-3 py-2 rounded-xl min-w-30">
			<FAIcon name={icon}/><CustomText textTag="h4">{`${title} : ${content}`}</CustomText>
		</Box>
	)
}

interface VagueAssignProps {
	vague: vagueType
}

const VagueHeader = ({ vague } : VagueAssignProps) => {

	const { 
		id,
		formation_nom: formation,
		debut,
		fin,
		etudiants: ownedStudents,
		quizzes_assignes: ownedQuiz 
	} = vague

	const { navigateTo } = useAppNavigation()

	return (
		<Paper className="flex flex-col relative p-5 items-center space-y-3">
			<CustomText textTag="h1" color="primary" weight="bold">{formation}</CustomText>
			<Box>
				<CustomText textTag="h5">Du {formatDate(debut)}</CustomText>
				<CustomText textTag="h5"> au {formatDate(fin)}</CustomText>
			</Box>
			<Box>
				<HeaderBloc title={'Quiz'} content={ownedQuiz.length} icon={'file'}/>
				<HeaderBloc title={'Etudiants'} content={ownedStudents.length} icon={'user-graduate'}/>
				{
					ownedStudents.length != 0 && <ActionButton onClick={() => navigateTo('/vagues/' + id + '/statistique')}>
						<FAIcon name="magnifying-glass-chart"/>Statistiques
					</ActionButton>
				}
			</Box>
		</Paper>
	)
}

const VagueAssign = () => {

	const { getAllVague } = useVague({})
	const { data: vagues, status } = getAllVague
	const { id } = useParams()
	
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
		quizzes_assignes: ownedQuiz 
	} = vague

	return (
		<BodyLayout
			title="Assignation de la vague"
			defaultLinkBack
		>
			<Box direction="column" className="space-y-5 w-full">
				<VagueHeader vague={vague} />
				<NavigationBar
					titles={['Quiz', 'Inscription']}				
				>
					<QuizAssignation 
						quiz={quiz}
						setQuiz={setQuiz}
						handleAssignQuiz={handleAssignQuiz}
						isPending={isAssignQuizPending}
						ownedQuiz={ownedQuiz}
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