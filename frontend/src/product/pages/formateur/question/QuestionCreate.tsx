import QuestionForm from "../../../../system/organisms/question/form/QuestionForm";
import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";

const QuestionCreate = () => {

	return (
		<BodyLayout
			title={"Création de question"}
			linkBack="gestion_question"
		>
			<Paper className="p-3">
				<QuestionForm />
			</Paper>
		</BodyLayout>
	)
}

export default QuestionCreate;