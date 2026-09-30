import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useQuiz } from "../../../../other/hooks/quiz/useQuiz";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import QuizQuestionDetail from "./QuizQuestionDetail";
import QuizAssignForm from "../../../../system/organisms/quiz/form/QuizAssignForm";
import { useState } from "react";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Paper from "../../../../system/atoms/Container/Paper";

const QuizQuestion = () => {

	const { id } = useParams()

	const { infoQuestionQuiz, infoQuiz } = useQuiz({ id: Number(id) })
	const { data : questions, isPending } = infoQuestionQuiz
	const { data: info, isPending: infoPending } = infoQuiz

	const [ activeTab, setActiveTab ] = useState(0);

	if (isPending || infoPending) return <Loading />

	if (!questions || !info) return  <FetchError />

	const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

	return (
		<BodyLayout
			title={"Détails du quiz"}
			defaultLinkBack={true}
		>
			<>
				<Paper className="p-5 w-full">
					<Box direction="column" className="items-center space-y-3 w-full">
						<CustomText textTag="h1" weight="bold" color="primary">{info.titre}</CustomText>
						<CustomText >{info.status}</CustomText>
						<CustomText >Du {info.date_ouverture} au {info.date_fermeture}</CustomText>
						<Box className="space-x-2">
							<CustomText >Questions : {questions.length}</CustomText>
							<CustomText >Total points : {totalPoints}</CustomText>
						</Box>
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