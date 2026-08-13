import useQuiz from "../../../other/hooks/quiz/useQuiz"
import type { quizType } from "../../../other/types/quizType"
import Box from "../../atoms/Container/Box"
import FetchError from "../../atoms/Loading/FetchError"
import Loading from "../../atoms/Loading/Loading"
import { Table, type Column } from "../../atoms/Table/Table"
import ActionButton from "../Buttons/ActionButton"

const quizTabColumn: Column<quizType>[] = [
	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: "Activité",
		key: "is_active"
	},
	{
		header: "Action",
		key: 'action',
		render: () => (
			<ActionButton 
				action={() => alert("Remove question")}
			>Effacer</ActionButton>
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
		<Box direction="column" customStyling="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={quizzes}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default QuizList;