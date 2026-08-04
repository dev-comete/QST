import type { responseType } from "../../../other/types/questionType"
import Box from "../../atoms/Container/Box"
import { Table, type Column } from "../../atoms/Table/Table"
import ActionButton from "../Buttons/ActionButton"

interface ResponseMakingProps {
	responses: responseType[]
}

type responseTable = {
	est_correcte: boolean,
	reponse: string,
	action: string
}

const responseMakingColumns: Column<responseTable>[] = [
	{
		header: 'Sélection',
		key: "est_correcte"
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

const transformToResponseTable = ( options: responseType[], action: string = 'delete'): responseTable[] => {
	return options.map((item) => ({ ...item, action,}));
};

const ResponseMakingList = ({ responses } : ResponseMakingProps) => {
	return (
		<Box direction="column" customStyling="w-full items-center justify-center">
			<Table 
				columns={responseMakingColumns}
				data={transformToResponseTable(responses)}
				rowKey={'est_correcte'}
			/>
		</Box>
	)
}

export {
	ResponseMakingList
}