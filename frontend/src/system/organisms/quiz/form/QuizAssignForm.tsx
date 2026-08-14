import type { Dispatch, SetStateAction } from "react";
import useAssignQuiz from "../../../../other/hooks/quiz/useAssignQuiz";
import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import QuizBankQuestion from "../list/QuizBankQuestion";
import QuizQuestionList from "../list/QuizQuestionList";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import AssignBloc from "../container/AssignBloc";

export interface QuizAssignManipProps {
	questions: assignQuestionType[]
	setQuestion: Dispatch<SetStateAction<assignQuestionType[]>>
}

const QuizAssignForm = () => {

	const { 
		selectedQuestion,
		setSelectedQuestion,
		handleAssignQuestion 
	} = useAssignQuiz()

	return (
		<form className="flex justify-center gap-10 w-full">
			<AssignBloc title="Banque de questions">
				<QuizBankQuestion
					questions={selectedQuestion}
					setQuestion={setSelectedQuestion}
				/>
			</AssignBloc>
			<AssignBloc title="Questions sélectionnées">
				<QuizQuestionList
					questions={selectedQuestion}
					setQuestion={setSelectedQuestion}
				/>
				<ActionButton
					type="submit"
					action={handleAssignQuestion}
					btnColor={selectedQuestion.length ? "success" : "disabled"}
					textColor="white"
					disabled={selectedQuestion.length == 0}
				>
					Assigner les questions
				</ActionButton>
			</AssignBloc>
		</form>
	)
}

export default QuizAssignForm;