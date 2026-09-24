import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import Box from "../../../../system/atoms/Container/Box";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import ModalQuizCreate from "../../../../system/organisms/quiz/form/ModalQuizCreate";
import QuizList from "../../../../system/organisms/quiz/list/QuizList";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useState } from "react";

const QuizManagement = () => {

	const [ open, setOpen ] = useState(false)

	const { navigateTo } = useAppNavigation()

	return (
		<BodyLayout
			title={"Gestion des quiz"}
			titleButton={
				<Box className="space-x-3">
					<ActionButton
						btnColor="white"
						textColor="text"
						onClick={() => navigateTo("gestion_quiz/corbeille")}
					>
						<span className="items-center">
							<FAIcon name="trash-can"/>
							{"Corbeille"}
						</span>
					</ActionButton>
					<ActionButton
						onClick={(e) => { e.preventDefault(); setOpen(true)}}
					>{"+ Créer un quiz "}</ActionButton>
				</Box>
			}
		>
			<QuizList />
			<ModalQuizCreate open={open} closeModal={() => setOpen(false)}/>
		</BodyLayout>
	)
}

export default QuizManagement;