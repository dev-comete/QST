import useAssignQuiz from "../../../../other/hooks/quiz/useAssignQuiz";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import QuizBankQuestion from "../list/QuizBankQuestion";
import QuizQuestionList from "../list/QuizQuestionList";
import AssignBloc from "../container/AssignBloc";
import type { QuestionQuiz } from "../../../../other/types/quizType";

interface QuizAssignManipProps {
	ownedQuestions: QuestionQuiz[]
}

const QuizAssignForm = ({ ownedQuestions } : QuizAssignManipProps) => {

	const { 
		selectedQuestion,
		setSelectedQuestion,
		handleAssignQuestion 
	} = useAssignQuiz()

	return (
		<form className="flex justify-center gap-10 w-full">
			<AssignBloc title="Banque de questions">
				<QuizBankQuestion
					ownedQuestions={ownedQuestions}
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