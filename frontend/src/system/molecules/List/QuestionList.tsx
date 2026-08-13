import { useQuestion } from "../../../other/hooks/question/useQuestion"
import type { questionType } from "../../../other/types/questionType"
import Box from "../../atoms/Container/Box"
import FetchError from "../../atoms/Loading/FetchError"
import Loading from "../../atoms/Loading/Loading"
import { Table, type Column } from "../../atoms/Table/Table"
import ActionButton from "../Buttons/ActionButton"

const questionTabColumn: Column<questionType>[] = [
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

const QuestionList = () => {

	const { getAllQuestion } = useQuestion()
	const { data: questions, status } = getAllQuestion

	if (status == "pending")
		return <Loading />

	if (!questions)
		return <FetchError />

	return (
		<Box direction="column" customStyling="w-full items-center justify-center">
			<Table 
				columns={questionTabColumn}
				data={questions}
				rowKey={'enonce_question'}
			/>
		</Box>
	)
}

export default QuestionList;