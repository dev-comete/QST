import ModalQuizCreate from "../../../../system/organisms/quiz/form/ModalQuizCreate";
import QuizList from "../../../../system/organisms/quiz/list/QuizList";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useState } from "react";

const QuizBin = () => {

	const [ open, setOpen ] = useState(false)

	return (
		<BodyLayout
			title={"Corbeille des quiz"}
			defaultLinkBack
		>
			<QuizList listType="trash"/>
			<ModalQuizCreate open={open} closeModal={() => setOpen(false)}/>
		</BodyLayout>
	)
}

export default QuizBin;