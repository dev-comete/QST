import type { vagueQuiz } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";
import { QuizStatusTag } from "../../quiz/tag/StatusTag";

const ownedQuizColumn : Column<vagueQuiz>[] = [
	{
		header: 'Nom',
		key: "titre"
	},
	{
		header: 'Statut',
		key: "status",
		render: (value) => <QuizStatusTag status={String(value)}/>
	}
]


const OwnedQuizList = ({ ownedQuiz} : { ownedQuiz : vagueQuiz[]}) => {
	return (
		<Table
			columns={ownedQuizColumn}
			data={ownedQuiz}
			rowKey={'id'}
			emptyTitle="Veuillez assigner des quiz à la session"
		/>
	)
}

export default OwnedQuizList;