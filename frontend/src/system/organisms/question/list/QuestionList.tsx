import { useQuestion } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton from "../../../molecules/Buttons/IconButton"

const questionTabColumn: Column<bankQuestionType>[] = [
	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: "Action",
		key: 'action',
		render: () => (
			<Box>
				<IconButton
					iconName="edit"
					iconStyling="text-text hover:text-success"
					action={() => alert('Edition')}
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

const QuestionList = () => {

	const { getAllQuestion } = useQuestion()
	const { data: questions, status } = getAllQuestion

	if (status == "pending")
		return <Loading />

	if (!questions)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={questionTabColumn}
				data={questions}
				rowKey={'enonce_question'}
			/>
		</Box>
	)
}

export default QuestionList;