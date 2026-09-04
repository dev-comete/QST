import type { Dispatch, SetStateAction } from "react";
import { useUser } from "../../../../other/hooks/user/useUser";
import Paper from "../../../atoms/Container/Paper";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import CustomText from "../../../atoms/Text/CustomText";
import ActionButton from "../../../molecules/Buttons/ActionButton";

interface StudentItemProps {
	addStudentToAssign: (e: React.MouseEvent<HTMLButtonElement>) => void,
	item: number,
	disabled: boolean
}

const StudentItem = ({ addStudentToAssign, item, disabled } : StudentItemProps) => {
	return (
		<Paper className="flex justify-between gap-3 items-center p-3 border border-background">
			<CustomText>{item}</CustomText>
			{
				!disabled &&
				<ActionButton
					onClick={addStudentToAssign}
					btnColor={"text"}
					textColor="white"
					disabled={disabled}
				>Ajouter</ActionButton>
			}
		</Paper>
	)
}

interface StudentListProps {
	students: number[]
	setStudents: Dispatch<SetStateAction<number[]>>
}


const StudentList = ({ students, setStudents } : StudentListProps) => {

	const { getUserQuery } = useUser({ role: 'apprenant'})
	const { data: studentList, status } = getUserQuery

	const handleSelectQuestion = (newId: number) => {
		setStudents((prev) => [...prev, newId]);
	};

	if (status == 'pending')
		return <Loading />
	if (!studentList)
		return <FetchError />

	return (
		<>
			{
				studentList.map((item) => {
					const isSelected = students?.some((q) => q === item.id);

					return (
						<StudentItem
							key={item.id}
							item={item.id}
							disabled={isSelected}
							addStudentToAssign={(e) => {
									e.preventDefault()
									handleSelectQuestion(item.id)
								}
							}
						/>
					)})
			}
		</>
	)
}

export default StudentList;