import type { studentQuizType } from "../../../../other/types/quizType";

interface StudentQuizListProps {
	data: studentQuizType[],
}

import { useNavigate } from "react-router"
import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton from "../../../molecules/Buttons/IconButton"
import PercentBadge from "../../../molecules/Badge/PercentBadge";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";

const ActionCell = ({ quizId, vagueId, variant } : {
	quizId : string | number | boolean,
	vagueId : string | number | boolean,
	variant: 'à faire' | 'terminé',
}) => {
    const navigate = useNavigate();

    return (
        <Box>
            <IconButton
                iconName={variant == 'terminé' ? "book" : "arrow-right"}
                iconStyling="text-text hover:text-success"
                action={() => {

					if (variant == 'terminé')
						navigate(`/quiz/${quizId}/revue?vague_id=${vagueId}`)
					else
						navigate(`/quiz/${quizId}/take?vague_id=${vagueId}`)
                }}
            />
        </Box>
    );
};

const StudentQuizList = ({ data } : StudentQuizListProps) => {
	const hasCompletedQuiz = data.some((row) => row.termine === true);

	const { navigateTo } = useAppNavigation()

	const quizTabColumn: Column<studentQuizType>[] = [
		{
			header: 'Vague',
			key: "vague_nom"
		},
		{
			header: 'Titre du quiz',
			key: "quiz_titre"
		},
		{
			header: 'Formation',
			key: "formation_nom"
		},
		{
			header: hasCompletedQuiz ? 'Score' : null,
			key: "score_obtenu",
			render: (value, row) => {
				if (row.termine === true) {
					return <PercentBadge value={Number(value)} />
				}
				return <ActionCell quizId={row.quiz_id ?? ''} vagueId={row.vague_id ?? ''} variant="à faire" />
			}
		}
	]

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={data}
				rowKey={'quiz_id'}
				onRowClick={(row) => navigateTo(`/quiz/${row.quiz_id}/revue?vague_id=${row.vague_id}`)}
			/>
		</Box>
	)
}

export default StudentQuizList;