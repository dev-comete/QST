import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useQuiz, useQuizUpdate } from "../../../../other/hooks/quiz/useQuiz";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import QuizQuestionDetail from "./QuizQuestionDetail";
import QuizAssignForm from "../../../../system/organisms/quiz/form/QuizAssignForm";
import { useState } from "react";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Paper from "../../../../system/atoms/Container/Paper";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import type { ColorTheme } from "../../../../other/types/common";
import ConfirmActionButton from "../../../../system/molecules/Buttons/ConfirmActionButton";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { formatDate } from "../../../../other/helper/helper";

interface QuizQuestionInfo {
	title: string
	value: string | number
	icon: string
	color: ColorTheme
}

const QuizQuestionCard = ({ title, value, icon, color } : QuizQuestionInfo) => {
	return (
		<Box className="p-2 rounded-xl justify-start items-center">
			<div className="w-15 h-15 bg-white rounded-xl flex items-center justify-center shadow-md">
				<FAIcon name={icon} size="lg" className={"text-" + color}/>
			</div>
			<Box direction="column">
				<CustomText textTag="h6">{title}</CustomText>
				<CustomText textTag="h2" weight="bold" color={color}>{value}</CustomText>
			</Box>
		</Box>
	)
}

const QuizQuestion = () => {

	const { id } = useParams()

	const { infoQuestionQuiz, infoQuiz } = useQuiz({ id: Number(id) })
	const { data : questions, isPending } = infoQuestionQuiz
	const { data: info, isPending: infoPending } = infoQuiz
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(id), info?.status ? info.status : 'draft')
	const { formations, formationsStatus } = useFormation()

	const [ activeTab, setActiveTab ] = useState(0);

	if (isPending || infoPending || formationsStatus == 'pending') return <Loading />

	if (!questions || !info || !formations) return  <FetchError />

	const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

	const formationName = formations.find((f) => String(info.formation) === String(f.id))?.nom_formation || 'Aucun'

	const isPublished = info.status == 'published'

	return (
		<BodyLayout
			title={info.titre}
			defaultLinkBack={true}
			titleButton={
				<ConfirmActionButton
					action={handleUpdateStatus}
					isLoading={updateIsPending}
					btnColor={isPublished ? 'disabled' : 'success'}
					confirmText="Voulez-vous changer le statut du quiz?"
					interiorIcon={isPublished ? 'arrow-down' : 'arrow-up'}
				>{isPublished ? 'Retirer' : 'Publier'}</ConfirmActionButton>
			}
		>
			<>
				<Paper className="p-5 w-full space-y-5">
					<Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
							value={info.status}
						/>
						<QuizQuestionCard
							title="Création"
							icon="calendar"
							color="text"
							value={formatDate(info.date_creation_quiz)}
						/>
						<QuizQuestionCard
							title="Questions"
							icon="question"
							color="primary"
							value={questions.length}
						/>
						<QuizQuestionCard
							title="Total"
							value={totalPoints + "pts"}
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
				<NavigationBar
					titles={['Détails', 'Assignation']}		
					activeTab={activeTab}
					onTabChange={(index) => setActiveTab(index)}				
				>
					<QuizQuestionDetail questions={questions}/>
					<QuizAssignForm ownedQuestions={questions}/>
				</NavigationBar>
			</>
		</BodyLayout>
	)
}

export default QuizQuestion;