import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useQuiz } from "../../../../other/hooks/quiz/useQuiz";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import QuizQuestionDetail from "./QuizQuestionDetail";
import QuizAssignForm from "../../../../system/organisms/quiz/form/QuizAssignForm";

const QuizQuestion = () => {

	const { id } = useParams()

	const { infoQuestionQuiz } = useQuiz(Number(id))
	const { data : questions, isPending } = infoQuestionQuiz

	if (isPending) return <Loading />

	if (!questions) return  <FetchError />

	return (
		<BodyLayout
			title={"Quiz et questions"}
			defaultLinkBack={true}
		>
			<NavigationBar
				titles={['Détails des questions', 'Assignation des questions']}				
			>
				<QuizQuestionDetail questions={questions}/>
				<QuizAssignForm ownedQuestions={questions}/>
			</NavigationBar>
		</BodyLayout>
	)
}

export default QuizQuestion;