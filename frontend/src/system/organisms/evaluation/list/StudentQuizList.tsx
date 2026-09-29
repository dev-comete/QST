import type { studentQuizType } from "../../../../other/types/quizType";

interface StudentQuizListProps {
	data: studentQuizType[],
}

import { useNavigate } from "react-router"
import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton from "../../../molecules/Buttons/IconButton"

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

const quizTabColumn: Column<studentQuizType>[] = [
	{
		header: 'Formation',
		key: "formation_nom"
	},
	{
		header: 'Titre du quiz',
		key: "quiz_titre"
	},
	{
		header: "Action",
		key: 'termine',
		render: (value, rowId) => {
			if (value == true)
				return <ActionCell quizId={rowId ? rowId.quiz_id : ''} vagueId={rowId ? rowId.vague_id : ''} variant="terminé" />
			else
				return <ActionCell quizId={rowId ? rowId.quiz_id : ''} vagueId={rowId ? rowId.vague_id : ''} variant="à faire" />
		}
		
	}
]

const StudentQuizList = ({ data } : StudentQuizListProps) => {

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={data}
				rowKey={'quiz_id'}
			/>
		</Box>
	)
}

export default StudentQuizList;