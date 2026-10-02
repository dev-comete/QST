import { useParams, useSearchParams } from "react-router";
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

interface QuizQuestionInfo {
	title: string
	value: string | number
	icon: string
	color: ColorTheme
}

export const QuizQuestionCard = ({ title, value, icon, color } : QuizQuestionInfo) => {
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
		<Paper className="p-3 w-1/3 shrink-0 min-h-[70vh]">
			<Box className="grid grid-cols-1">
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
	)
}

const QuizQuestion = () => {

	const { id } = useParams()

	const { infoQuestionQuiz, infoQuiz } = useQuiz({ id: Number(id) })
	const { data : questions, isPending } = infoQuestionQuiz
	const { data: info, isPending: infoPending } = infoQuiz
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(id), info?.status ? info.status : 'draft')
	const { formations, formationsStatus } = useFormation()

	const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read activeTab from URL search params "?tab=0" (defaults to 0)
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

  // 2. Update the URL search params when changing tabs
  const handleTabChange = (index: number) => {
    setSearchParams((prev) => {
      prev.set('tab', index.toString());
      return prev;
    });
  };

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
				>{isPublished ? 'Retirer' : 'Publier'}</ConfirmActionButton>
			}
		>
			<>
				
				<NavigationBar
					titles={['Détails', 'Assignation']}		
					activeTab={activeTab}
					onTabChange={handleTabChange}				
				>
					<Box className="w-full items-start">
						<QuizInformations
							info={info}
							questions={questions}
							isPublished={isPublished}
							formations={formations}
						/>
						<div className="flex-1 min-w-0 overflow-y-auto max-h-[70vh]">
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