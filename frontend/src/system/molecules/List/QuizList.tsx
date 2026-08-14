import { useNavigate } from "react-router"
import { formatDate } from "../../../other/helper/helper"
import useCreateQuiz from "../../../other/hooks/quiz/useCreateQuiz"
import type { quizType } from "../../../other/types/quizType"
import Box from "../../atoms/Container/Box"
import FetchError from "../../atoms/Loading/FetchError"
import Loading from "../../atoms/Loading/Loading"
import { Table, type Column } from "../../atoms/Table/Table"
import IconButton from "../Buttons/IconButton"

const ActionCell = ({ rowId } : {rowId : string | number | boolean }) => {
    const navigate = useNavigate();

    return (
        <Box>
            <IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => {
                    navigate(`/formateur/${rowId}/assign_quiz`);
                }}
            />
            <IconButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={() => alert('Suppression')}
            />
        </Box>
    );
};

const quizTabColumn: Column<quizType>[] = [
	{
		header: 'Formation',
		key: "formation"
	},
	{
		header: 'Statut',
		key: "status"
	},
	{
		header: 'Durée',
		key: "duree"
	},
	{
		header: 'Date de création',
		key: "date_creation_quiz",
		render: (value) => formatDate(value)
	},
	{
		header: "Action",
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} />
		}
		
	}
]

// Todo : Transform formation(id) to formation(name) and render with new quizType
const QuizList = () => {

	const { getAllQuiz } = useCreateQuiz()
	const { data: quizzes, status } = getAllQuiz

	if (status == 'pending')
		return <Loading />
	
	if (!quizzes)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={quizzes}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default QuizList;