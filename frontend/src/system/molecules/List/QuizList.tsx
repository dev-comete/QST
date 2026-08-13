import { formatDate } from "../../../other/helper/helper"
import useQuiz from "../../../other/hooks/quiz/useQuiz"
import type { quizType } from "../../../other/types/quizType"
import Box from "../../atoms/Container/Box"
import FetchError from "../../atoms/Loading/FetchError"
import Loading from "../../atoms/Loading/Loading"
import { Table, type Column } from "../../atoms/Table/Table"
import IconButton from "../Buttons/IconButton"

const quizTabColumn: Column<quizType>[] = [
	{
		header: 'Formation',
		key: "formation"
	},
	{
		header: 'Statut',
		key: "status"
	},
	{
		header: 'Durée',
		key: "duree"
	},
	{
		header: 'Date de création',
		key: "date_creation_quiz",
		render: (value) => formatDate(value)
	},
	{
		header: "Action",
		key: 'action',
		render: () => (
			<Box>
				<IconButton
					iconName="edit"
					iconStyling="text-text hover:text-success"
					action={() => alert('Assign question')}
				/>
				<IconButton
					iconName="trash"
					iconStyling="text-text hover:text-error"
					action={() => alert('Suppression')}
				/>
			</Box>
		)
	}
]

const QuizList = () => {

	const { getAllQuiz } = useQuiz()
	const { data: quizzes, status } = getAllQuiz

	if (status == 'pending')
		return <Loading />
	
	if (!quizzes)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={quizzes}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default QuizList;