import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuizList from "../../../../system/molecules/List/QuizList";
import ModalQuizCreate from "../../../../system/organisms/quiz/form/ModalQuizCreate";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useState } from "react";

const QuizManagement = () => {

	const [ open, setOpen ] = useState(false)

	return (
		<BodyLayout
			title={"Liste des quiz"}
			titleButton={
				<ActionButton
					action={(e) => { e.preventDefault(); setOpen(true)}}
					btnColor="secondary"
					textColor="white"
				>{"+ Créer un quiz "}</ActionButton>
			}
		>
			<QuizList />
			<ModalQuizCreate open={open} closeModal={() => setOpen(false)}/>
		</BodyLayout>
	)
}

export default QuizManagement;