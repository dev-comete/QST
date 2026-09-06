import type { Dispatch, SetStateAction } from "react";
import { useAssignVague } from "../../../../other/hooks/vague/useAssignVague";
import type { etudiantType } from "../../../../other/types/vagueType";
import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import AssignBloc from "../../../../system/organisms/quiz/container/AssignBloc";
import QuizVagueList from "../../../../system/organisms/vague/list/QuizVagueList";
import StudentList from "../../../../system/organisms/vague/list/StudentList";
import VagueStudentList from "../../../../system/organisms/vague/list/VagueStudentList";

interface VagueAssignProps {
	vagueId: number
	ownedStudents: etudiantType[]
	setSelectedId: Dispatch<SetStateAction<number | null>>
}

const VagueAssign = ({ vagueId, ownedStudents, setSelectedId } : VagueAssignProps) => {

	const { 
		quiz, setQuiz, isAssignQuizPending, handleAssignQuiz,
		students, setStudents, isAssignStudPending, handleAssignStudent
	} = useAssignVague(vagueId)

	return (
		<Box direction="column" className="space-y-5 w-full">
			<ActionButton
				btnColor="text"
				onClick={() => setSelectedId(null)}
			>Retour</ActionButton>
			<NavigationBar
				titles={['Quiz', 'Etudiants']}				
			>
				<Paper className="p-5 flex flex-col space-y-5 items-center">
					<QuizVagueList setQuiz={setQuiz} />
					<ActionButton
						type="submit"
						onClick={(e) => {e.preventDefault() ; handleAssignQuiz()}}
						btnColor={quiz ? "success" : "disabled"}
						textColor="white"
						disabled={quiz == null}
						isLoading={isAssignQuizPending}
					>
						Assigner le quiz
					</ActionButton>
				</Paper>
				<Box>
					<AssignBloc title="Liste des étudiants">
						<StudentList
							ownedStudents={ownedStudents}
							setStudents={setStudents}
						/>
						<ActionButton
							type="submit"
							onClick={(e) => {e.preventDefault() ; console.log("clicked"); handleAssignStudent()}}
							btnColor={students.length ? "success" : "disabled"}
							textColor="white"
							disabled={students.length == 0}
							isLoading={isAssignStudPending}
						>
							Assigner les étudiants
						</ActionButton>
					</AssignBloc>
					<AssignBloc title="Etudiants inscrits dans la vague">
						<VagueStudentList ownedStudents={ownedStudents}/>
					</AssignBloc>
				</Box>
			</NavigationBar>
		</Box>
	)
}

export default VagueAssign;