import type { questionType } from "../../../other/types/questionType"
import Box from "../../atoms/Container/Box"
import { Table, type Column } from "../../atoms/Table/Table"
import ActionButton from "../Buttons/ActionButton"

interface QuestionTabProps {
	questions: questionType[]
}

const questionTabColumn: Column<questionType>[] = [
	{
		header: 'Sélection',
		key: "est_correct"
	},
	{
		header: "Réponse",
		key: "reponse"
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

const QuestionTab = ({ questions } : QuestionTabProps) => {
	return (
		<Box direction="column" customStyling="w-full items-center justify-center">
			<Table 
				columns={questionTabColumn}
				data={questions}
				rowKey={'type_id'}
			/>
		</Box>
	)
}

export default QuestionTab;