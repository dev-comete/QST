import Box from "../../../atoms/Container/Box"
import Table, { type Column } from "../../../atoms/Table/Table"
import IconButton from "../../../molecules/Buttons/IconButton";
import type { DetailQuiz } from "../../../../other/types/bulletinType";
import { useNavigate } from "react-router";
import { useMemo } from "react";
import PercentBadge from "../../../molecules/Badge/PercentBadge";
import StatusBadge from "../../../molecules/Badge/StatusBadge";

const ActionCell = ({ rowId } : {
	rowId : string | number | boolean,
}) => {
    const navigate = useNavigate();

    return (
        <Box>
            <IconButton
                iconName={"book"}
                iconStyling="text-text hover:text-primary"
                action={() => {
					navigate(`/quiz/${rowId}/revue`)
                }}
            />
        </Box>
    );
};

const getQuizTabColumns = () : Column<DetailQuiz>[] => [
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
	{
		header: 'Action',
		key: 'quiz_id',
		render: (value, row) => row?.statut == 'Terminé' && <ActionCell rowId={value ?? ''}/>
	}
]

interface EvaluationListProps {
	data: DetailQuiz[],
}

const EvaluationList = ({ data } : EvaluationListProps) => {

	const columns = useMemo(() => getQuizTabColumns(), []);

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				title="Détails des évaluations"
				columns={columns}
				data={data}
				rowKey={'quiz_id'}
			/>
		</Box>
	)
}
export default EvaluationList;