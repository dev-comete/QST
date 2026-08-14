import QuizAssignForm from "../../../../system/organisms/quiz/form/QuizAssignForm";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuizAssign = () => {
	return (
		<BodyLayout
			title="Assignation de questions"
			linkBack="/formateur/gestion_quiz"
		>
			<QuizAssignForm />
		</BodyLayout>
	)
}

export default QuizAssign;