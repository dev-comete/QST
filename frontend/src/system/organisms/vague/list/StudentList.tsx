import type { Dispatch, SetStateAction } from "react";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";
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
	studentList: userType[]
	setStudents: Dispatch<SetStateAction<number[]>>
}


const StudentList = ({ studentList, setStudents } : StudentListProps) => {

	const handleSelectQuestion = (newId: number) => {
		setStudents((prev) => [...prev, newId]);
	};

	return (
		<Box direction="column" className="w-full">
			{
				studentList.map((item) => {

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