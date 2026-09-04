import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import ModalQuizCreate from "../../../../system/organisms/quiz/form/ModalQuizCreate";
import QuizList from "../../../../system/organisms/quiz/list/QuizList";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useState } from "react";

const QuizManagement = () => {

	const [ open, setOpen ] = useState(false)

	return (
		<BodyLayout
			title={"Liste des quiz"}
			titleButton={
				<ActionButton
					onClick={(e) => { e.preventDefault(); setOpen(true)}}
				>{"+ Créer un quiz "}</ActionButton>
			}
		>
			<QuizList />
			<ModalQuizCreate open={open} closeModal={() => setOpen(false)}/>
		</BodyLayout>
	)
}

export default QuizManagement;