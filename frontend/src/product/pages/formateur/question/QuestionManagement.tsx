import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuestionList from "../../../../system/molecules/List/QuestionList";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useNavigate } from "react-router";

const QuestionManagement = () => {
	const navigate = useNavigate()

    return (
        <BodyLayout
			title={"Liste des questions"}
			titleButton={
				<ActionButton
					action={() => navigate("/formateur/creation_question")}
				>{"+ Créer une question"}</ActionButton>
			}
		>
			<QuestionList />
		</BodyLayout>
    )
}

export default QuestionManagement;