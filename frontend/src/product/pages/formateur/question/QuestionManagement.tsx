import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import Box from "../../../../system/atoms/Container/Box";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuestionList from "../../../../system/organisms/question/list/QuestionList";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuestionManagement = () => {

	const { navigateTo } = useAppNavigation()

    return (
        <BodyLayout
			title={"Banque de questions"}
			titleButton={
				<Box className="space-x-3">
					<ActionButton
						btnColor="white"
						textColor="text"
						onClick={() => navigateTo("gestion_question/corbeille")}
					>
						<Box className="items-center">
							<FAIcon name="trash-can"/>
							{"Corbeille"}
						</Box>
					</ActionButton>
					<ActionButton
						onClick={() => navigateTo("creation_question")}
					>{"+ Créer une question"}</ActionButton>
				</Box>
			}
		>
			<QuestionList />
		</BodyLayout>
    )
}

export default QuestionManagement;