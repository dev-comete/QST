import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import { useNavigate } from "react-router";

const QuestionManagement = () => {

	const navigate = useNavigate()

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
			{"Liste des questions"}
		</BodyLayout>
    )
}

export default QuestionManagement;