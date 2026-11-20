import type { Dispatch, SetStateAction } from "react";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";
import type { userType } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";

interface StudentItemProps {
	checked: boolean;
	toggleStudent: (id: number) => void;
	item: userType,
}

const StudentItem = ({ toggleStudent, item, checked }: StudentItemProps) => (
	<Paper className="flex justify-between gap-3 items-center p-3 border border-background w-full justify-start">
		<Box>
			<Input
				id={`check-${item.id}`}
				name={`check-${item.id}`}
				type="checkbox"
				checked={checked}
				onChange={() => toggleStudent(item.id)}
				className="cursor-pointer h-4 w-4 rounded"
			/>
		</Box>
		<CustomText>{item.username}</CustomText>
	</Paper>
)

interface StudentListProps {
	studentList: userType[]
	students: number[]
	setStudents: Dispatch<SetStateAction<number[]>>
}


const StudentList = ({ studentList, students, setStudents } : StudentListProps) => {
	const toggleStudent = (id: number) => {
		setStudents((prev) =>
			prev.includes(id)
				? prev.filter((studentId) => studentId !== id)
				: [...prev, id]
		);
	};
	
	return (
		<Box direction="column" className="w-full">
			{studentList.map((item) => (
				<StudentItem
					key={item.id}
					item={item}
					checked={students.some((s) => s === item.id)}
					toggleStudent={toggleStudent}
				/>
			))}
		</Box>
	)
}

export default StudentList;