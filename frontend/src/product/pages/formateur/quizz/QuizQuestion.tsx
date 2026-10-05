import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useQuiz, useQuizUpdate } from "../../../../other/hooks/quiz/useQuiz";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import QuizQuestionDetail from "./QuizQuestionDetail";
import QuizAssignForm from "../../../../system/organisms/quiz/form/QuizAssignForm";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Paper from "../../../../system/atoms/Container/Paper";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import type { ColorTheme } from "../../../../other/types/common";
import ConfirmActionButton from "../../../../system/molecules/Buttons/ConfirmActionButton";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import type { QuestionQuiz, quizType } from "../../../../other/types/quizType";
import type { Formation } from "../../../../other/types/formationType";
import { useTabNavigation } from "../../../../other/hooks/navigation/useTabNavigation";
import { padZero } from "../../../../other/helper/helper";

interface QuizQuestionInfo {
	title: string
	value: string | number
	icon?: string
	color?: ColorTheme
}

export const QuizQuestionCard = ({ title, value, icon, color } : QuizQuestionInfo) => {
	return (
		<Box className="p-2 rounded-xl justify-start items-center">
			{
				icon && 
				<div className="w-15 h-15 bg-white rounded-xl flex items-center justify-center shadow-md">
					<FAIcon name={icon} size="lg" className={"text-" + color}/>
				</div>
			}
			<Box direction="column">
				<CustomText textTag="h6">{title}</CustomText>
				<CustomText textTag="h3" weight="bold" color={color}>{padZero(value)}</CustomText>
			</Box>
		</Box>
	)
}

interface QuizInformationsProps {
	questions : QuestionQuiz[]
	info: quizType
	isPublished: boolean
	formations: Formation[]
}

const QuizInformations = ({ questions, info, isPublished, formations } : QuizInformationsProps) => {

	const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

	const formationName = formations.find((f) => String(info.formation) === String(f.id))?.nom_formation || 'Aucun'

	return (
		<Paper className="p-3 w-full">
			<Box className="justify-between">
					<QuizQuestionCard
						title="Formation"
						value={formationName}
						icon="book"
						color="text"
					/>
					<QuizQuestionCard
						title="Statut"
						icon="tag"
						color={isPublished ? 'success' : 'disabled'}
						value={isPublished ? 'Publié' : 'Brouillon'}
					/>
					<QuizQuestionCard
						title="Questions"
						icon="question"
						color="primary"
						value={questions.length}
					/>
					<QuizQuestionCard
						title="Points"
						value={totalPoints}
						icon="star"
						color="success"
					/>
					<QuizQuestionCard
						title="Durée"
						value={info.duree}
						icon="clock"
						color="warning"
					/>
				</Box>
		</Paper>
	)
}

const QuizQuestion = () => {

	const { id } = useParams()

	const { infoQuestionQuiz, infoQuiz } = useQuiz({ id: Number(id) })
	const { data : questions, isPending } = infoQuestionQuiz
	const { data: info, isPending: infoPending } = infoQuiz
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(id), info?.status ? info.status : 'draft')
	const { formations, formationsStatus } = useFormation()
	const { activeTab, handleTabChange } = useTabNavigation();

	if (isPending || infoPending || formationsStatus == 'pending') return <Loading />

	if (!questions || !info || !formations) return  <FetchError />

	const isPublished = info.status == 'published'

	return (
		<BodyLayout
			title={info.titre}
			linkBack="gestion_quiz"
			titleButton={
				<ConfirmActionButton
					action={handleUpdateStatus}
					isLoading={updateIsPending}
					btnColor={isPublished ? 'disabled' : 'success'}
					confirmText="Voulez-vous changer le statut du quiz?"
					interiorIcon={isPublished ? 'arrow-down' : 'arrow-up'}
				>{isPublished ? 'Fermer le quiz' : 'Rendre accessible'}</ConfirmActionButton>
			}
		>
			<>
				<NavigationBar
					titles={['Détails', 'Assignation']}		
					activeTab={activeTab}
					onTabChange={handleTabChange}				
				>
					<Box direction="column" className="w-3/4 m-auto items-start">
						<QuizInformations
							info={info}
							questions={questions}
							isPublished={isPublished}
							formations={formations}
						/>
						<div className="w-full overflow-y-auto max-h-[60vh]">
							<QuizQuestionDetail questions={questions}/>
						</div>
					</Box>
					<QuizAssignForm ownedQuestions={questions}/>
				</NavigationBar>
			</>
		</BodyLayout>
	)
}

export default QuizQuestion;