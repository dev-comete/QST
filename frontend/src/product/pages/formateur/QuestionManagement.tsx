import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import ModalCreateQuestion from "../../../system/molecules/Modal/ModalQuestion";
import BodyLayout from "../../layout/common/BodyLayout";

const QuestionManagement = () => {

	const [ open, setOpen ] = useState(false)

    return (
        <BodyLayout
			title={"Liste des questions"}
			titleButton={
				<ActionButton
					action={() => setOpen(true)}
					btnColor="secondary"
					textColor="white"
				>{"+ Créer une question"}</ActionButton>
		}
		>
			<ModalCreateQuestion 
				isOpen={open}
				closeModal={() => setOpen(false)}
			/>
		</BodyLayout>
    )
}

export default QuestionManagement;