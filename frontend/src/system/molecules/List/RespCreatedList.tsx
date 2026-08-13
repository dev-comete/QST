import { useCreateQuestion } from "../../../other/hooks/question/useQuestionCreate"
import type { respType } from "../../../other/types/questionType"
import Box from "../../atoms/Container/Box"
import { Table, type Column } from "../../atoms/Table/Table"
import ActionButton from "../Buttons/ActionButton"

const responseMakingColumns: Column<respType>[] = [
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

const RespCreatedList = () => {

	const { question } = useCreateQuestion()
	const responses = question.options

	return (
		<Box direction="column" customStyling="w-full items-center justify-center">
			<Table 
				columns={responseMakingColumns}
				data={responses}
				rowKey={'est_correct'}
			/>
		</Box>
	)
}

export default RespCreatedList
