import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";
import QuestionEditForm from "../../../../system/organisms/question/form/QuestionEditForm";

const QuestionEdit = () => {

	return (
		<BodyLayout
			title={"Modification de la question"}
			linkBack="gestion_question"
		>
			<Paper className="p-3">
				<QuestionEditForm />
			</Paper>
		</BodyLayout>
	)
}

export default QuestionEdit;