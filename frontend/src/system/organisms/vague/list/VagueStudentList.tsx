import type { etudiantType } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";

const ownedStudentColumn : Column<etudiantType>[] = [
	{
		header: 'Nom',
		key: "username"
	},
	{
		header: 'Email',
		key: "email",
	}
]


const VagueStudentList = ({ ownedStudents} : { ownedStudents : etudiantType[]}) => {
	return (
		<Table
			columns={ownedStudentColumn}
			data={ownedStudents}
			rowKey={'etudiant_id'}
		/>
	)
}

export default VagueStudentList;