import type { Dispatch, SetStateAction } from "react";
import { useUser } from "../../../../other/hooks/user/useUser";
import Paper from "../../../atoms/Container/Paper";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";
import type { etudiantType } from "../../../../other/types/vagueType";
import type { userType } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";

interface StudentItemProps {
	addStudentToAssign: (id: number) => void,
	item: userType,
}

const StudentItem = ({ addStudentToAssign, item } : StudentItemProps) => {

	return (
		<Paper className="flex justify-between gap-3 items-center p-3 border border-background w-full justify-start">
			<Box>
				<Input
					id={`check + ${item}`}
					name={`check + ${item}`}
					type="checkbox"
					// checked={Boolean(value)}
					onChange={() => addStudentToAssign(item.id)}
					className="cursor-pointer h-4 w-4 rounded"
				/>
			</Box>
			<CustomText>{item.username}</CustomText>
		</Paper>
	)
}

interface StudentListProps {
	ownedStudents: etudiantType[]
	setStudents: Dispatch<SetStateAction<number[]>>
}


const StudentList = ({ ownedStudents, setStudents } : StudentListProps) => {

	const { getUserQuery } = useUser({ role: 'apprenant'})
	const { data: studentList, status } = getUserQuery

	const handleSelectQuestion = (newId: number) => {
		setStudents((prev) => [...prev, newId]);
	};

	if (status == 'pending')
		return <Loading />
	if (!studentList)
		return <FetchError />
	
	const studentNotSubsribed = studentList.filter(
		(apprenant) => !ownedStudents.some((e) => e.etudiant_id === apprenant.id)
	);

	return (
		<Box className="w-full">
			{
				studentNotSubsribed.map((item) => {

				return (
					<StudentItem
						key={item.id}
						item={item}
						addStudentToAssign={handleSelectQuestion}
					/>
				)})
			}
		</Box>
	)
}

export default StudentList;