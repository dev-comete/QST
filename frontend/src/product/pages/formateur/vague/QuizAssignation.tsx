import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuizVagueSelect from "../../../../system/organisms/vague/list/QuizVagueSelect";
import Paper from "../../../../system/atoms/Container/Paper";
import type { Dispatch, SetStateAction } from "react";
import Box from "../../../../system/atoms/Container/Box";
import AssignBloc from "../../../../system/organisms/quiz/container/AssignBloc";
import OwnedQuizList from "../../../../system/organisms/vague/list/OwnedQuizList";
import type { vagueQuiz } from "../../../../other/types/vagueType";

interface QuizAssignationProps {
	ownedQuiz: vagueQuiz[]
	quiz: number | null
	setQuiz: Dispatch<SetStateAction<number | null>>
	handleAssignQuiz: () => void
	isPending: boolean
}

const QuizAssignation = ({ ownedQuiz, quiz, setQuiz, handleAssignQuiz, isPending } : QuizAssignationProps) => {
	return (
		<Box>
			<Paper className="flex flex-col items-center justify-center p-5 gap-3 w-1/3">
				<QuizVagueSelect setQuiz={setQuiz} />
				<Box className="items-center">
					<ActionButton
						type="submit"
						onClick={(e) => {e.preventDefault() ; handleAssignQuiz()}}
						btnColor={quiz ? "success" : "disabled"}
						textColor="white"
						disabled={quiz == null}
						isLoading={isPending}
					>
						Assigner
					</ActionButton>
				</Box>
			</Paper>
			<AssignBloc title="Quiz assignés">
				<OwnedQuizList ownedQuiz={ownedQuiz}/>
			</AssignBloc>
		</Box>
	)
}

export default QuizAssignation;