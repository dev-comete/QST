import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuestionList from "../../../../system/molecules/List/QuestionList";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuestionManagement = () => {

	const { navigateTo } = useAppNavigation()

    return (
        <BodyLayout
			title={"Liste des questions"}
			titleButton={
				<ActionButton
					action={() => navigateTo("creation_question")}
				>{"+ Créer une question"}</ActionButton>
			}
		>
			<QuestionList />
		</BodyLayout>
    )
}

export default QuestionManagement;