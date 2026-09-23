import AssignBloc from "../../../../system/organisms/quiz/container/AssignBloc";
import StudentList from "../../../../system/organisms/vague/list/StudentList";
import VagueStudentList from "../../../../system/organisms/vague/list/VagueStudentList";
import CustomText from "../../../../system/atoms/Text/CustomText";
import { useUser } from "../../../../other/hooks/user/useUser";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import type { etudiantType } from "../../../../other/types/vagueType";
import Box from "../../../../system/atoms/Container/Box";
import type { Dispatch, SetStateAction } from "react";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";

interface StudentAssignationProps {
	ownedStudents: etudiantType[]
	students: number[]
	setStudents: Dispatch<SetStateAction<number[]>>
	handleAssignStudent: () => void
	isPending: boolean
}

export const StudentAssignation = ({
	ownedStudents,
	students,
	setStudents,
	handleAssignStudent,
	isPending } : StudentAssignationProps) => {

	const { getUserQuery } = useUser({ role: 'apprenant'})
	const { data: studentList, status } = getUserQuery

	if (status == 'pending') return <Loading />

	if (!studentList) return <FetchError />

	const studentNotSubsribed = studentList.filter(
		(apprenant) => !ownedStudents.some((e) => e.etudiant_id === apprenant.id)
	);

	return (
		<Box>
			<AssignBloc title="Liste des étudiants">
				{
					studentNotSubsribed.length === 0
					?	<CustomText>Tous les étudiants sont inscrits dans la session</CustomText>
					: 	
						<>
							<StudentList
								studentList={studentNotSubsribed}
								setStudents={setStudents}
							/>
							<ActionButton
								type="submit"
								onClick={(e) => {e.preventDefault() ; handleAssignStudent()}}
								btnColor={students.length ? "success" : "disabled"}
								textColor="white"
								disabled={students.length == 0}
								isLoading={isPending}
							>
								Assigner les étudiants
							</ActionButton>
						</>
				}
			</AssignBloc>
			<AssignBloc title="Liste des étudiants inscrits">
				<VagueStudentList ownedStudents={ownedStudents}/>
			</AssignBloc>
		</Box>
	)
}

