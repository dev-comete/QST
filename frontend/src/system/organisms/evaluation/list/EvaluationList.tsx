import Box from "../../../atoms/Container/Box"
import Table, { type Column } from "../../../atoms/Table/Table"
import type { DetailQuiz } from "../../../../other/types/bulletinType";
import { useMemo } from "react";
import PercentBadge from "../../../molecules/Badge/PercentBadge";
import StatusBadge from "../../../molecules/Badge/StatusBadge";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";

const getQuizTabColumns = () : Column<DetailQuiz>[] => [
	{
		header: 'Titre du quiz',
		key: "quiz_titre"
	},
	{
		header: 'Quiz ID',
		key: "quiz_id"
	},
	{
		header: 'Statut',
		key: "statut",
		render: (value) => <StatusBadge value={String(value)} />
	},
	{
		header: 'Score obtenu',
		key: "score_obtenu",
		render: (value, row) => String(value) + ' / ' + String(row?.score_maximum)
	},
	{
		header: "Pourcentage",
		key: 'pourcentage',
		render: (value) => <PercentBadge value={Number(value)} />
		
	},
]

interface EvaluationListProps {
	data: DetailQuiz[],
	vagueId: string
}

const EvaluationList = ({ data, vagueId } : EvaluationListProps) => {

	const columns = useMemo(() => getQuizTabColumns(), []);

	const { navigateTo } = useAppNavigation()

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				title="Détails des évaluations"
				columns={columns}
				data={data}
				rowKey={'quiz_id'}
				onRowClick={(row) => navigateTo(`/quiz/${row.quiz_id}/revue?vague_id=${vagueId}`)}			/>
		</Box>
	)
}
export default EvaluationList;