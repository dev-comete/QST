import { useAssignVague } from "../../../../other/hooks/vague/useAssignVague";
import Box from "../../../atoms/Container/Box";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import AssignBloc from "../../quiz/container/AssignBloc";
import QuizVagueList from "../list/QuizVagueList";
import StudentList from "../list/StudentList";
import VagueStudentList from "../list/VagueStudentList";

const VagueAssignForm = () => {
	const { 
		quiz, setQuiz, quizStatus, handleAssignQuiz,
		students, setStudents, studentStatus, handleAssignStudent
	} = useAssignVague()

	if (quizStatus == 'pending' || studentStatus == 'pending')
		return <Loading />

	return (
		<form className="flex flex-col justify-center gap-10 w-full">
			<AssignBloc title="Assignation de quiz">
				<QuizVagueList setQuiz={setQuiz} />
					<ActionButton
						type="submit"
						action={(e) => {e.preventDefault() ; handleAssignQuiz()}}
						btnColor={quiz ? "success" : "disabled"}
						textColor="white"
						disabled={quiz == null}
					>
						Assigner le quiz
					</ActionButton>
			</AssignBloc>
			<Box>
				<AssignBloc title="Liste des étudiants">
					<StudentList
						students={students}
						setStudents={setStudents}
					/>
				</AssignBloc>
				<AssignBloc title="Etudiants inscrits dans la vague">
					<VagueStudentList />
					<ActionButton
						type="submit"
						action={(e) => {e.preventDefault() ; handleAssignStudent()}}
						btnColor={students.length ? "success" : "disabled"}
						textColor="white"
						disabled={students.length == 0}
					>
						Assigner les étudiants
					</ActionButton>
				</AssignBloc>
			</Box>
		</form>
	)
}
export default VagueAssignForm;