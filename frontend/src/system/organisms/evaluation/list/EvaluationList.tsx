import Box from "../../../atoms/Container/Box"
import Table, { type Column } from "../../../atoms/Table/Table"
import type { DetailQuiz } from "../../../../other/types/bulletinType";
import { useMemo } from "react";
import PercentBadge from "../../../molecules/Badge/PercentBadge";
import StatusBadge from "../../../molecules/Badge/StatusBadge";
import { useNavigate } from "react-router";

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
	vagueId: string,
	studentId?: string | null
}

const EvaluationList = ({ data, vagueId, studentId } : EvaluationListProps) => {

	const columns = useMemo(() => getQuizTabColumns(), []);
	const navigate = useNavigate()

	const filteredData = data.filter((d) => d.statut == 'Terminé')

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				title="Détails des évaluations"
				columns={columns}
				data={filteredData}
				rowKey={'quiz_id'}
				onRowClick={(row) => {
					const searchParams = new URLSearchParams({ vague_id: vagueId })
					if (studentId) searchParams.set('student_id', studentId)
					navigate(`/quiz/${row.quiz_id}/revue?${searchParams.toString()}`)
				}}
			/>
		</Box>
	)
}
export default EvaluationList;