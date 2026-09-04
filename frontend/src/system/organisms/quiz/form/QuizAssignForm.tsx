import type { Dispatch, SetStateAction } from "react";
import useAssignQuiz from "../../../../other/hooks/quiz/useAssignQuiz";
import type { assignQuestionType } from "../../../../other/types/questionType";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import QuizBankQuestion from "../list/QuizBankQuestion";
import QuizQuestionList from "../list/QuizQuestionList";
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
					onClick={(e) => {e.preventDefault() ; handleAssignQuestion()}}
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