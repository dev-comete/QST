import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import ModalCreateQuestion from "../../../system/molecules/Modal/ModalQuestion";
import BodyLayout from "../../layout/common/BodyLayout";

const QuestionManagement = () => {

    return (
        <BodyLayout title={"Liste des questions"}>
			<ActionButton
				action={() => console.log("Create")}
				btnColor="secondary"
				textColor="white"
			>{"+ Créer une question"}</ActionButton>
			<ModalCreateQuestion />
		</BodyLayout>
    )
}

export default QuestionManagement;