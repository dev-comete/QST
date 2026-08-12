import { useQuestion } from "../../../other/hooks/useQuestion";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import QuestionTab from "../../../system/molecules/List/QuestionTab";
import BodyLayout from "../../layout/common/BodyLayout";
import { useNavigate } from "react-router";

const QuestionManagement = () => {

	const navigate = useNavigate()
	const { getAllQuestion } = useQuestion()
	const { data, status } = getAllQuestion

	if (status == "pending")
		return <div>Loading...</div>

	if (!data)
		return <div>Error</div>

    return (
        <BodyLayout
			title={"Liste des questions"}
			titleButton={
				<ActionButton
					action={() => navigate("/formateur/creation_question")}
					btnColor="secondary"
					textColor="white"
				>{"+ Créer une question"}</ActionButton>
		}
		>
			<QuestionTab questions={data}/>
		</BodyLayout>
    )
}

export default QuestionManagement;