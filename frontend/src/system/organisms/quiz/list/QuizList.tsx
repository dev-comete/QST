import { useState } from "react";
import { formatDate } from "../../../../other/helper/helper";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import { useQuiz, useQuizDel, useQuizUpdate } from "../../../../other/hooks/quiz/useQuiz";
import type { quizType } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { Table, type Column } from "../../../atoms/Table/Table";
import CustomText from "../../../atoms/Text/CustomText";
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import ModalQuizUpdate from "../form/ModalQuizUpdate";

const ActionCell = ({ rowId, row, onEdit } : {
	rowId : string | number | boolean,
	row: quizType | null
	onEdit: (id: string | number | boolean | string[]) => void 
}) => {
    const { navigateTo } = useAppNavigation();
	const { handleDelQuiz, isPending } = useQuizDel(Number(rowId))
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(rowId), row ? row.status : 'draft')

    return (
        <Box>
			<IconConfirmActionButton
                iconName={row && row.status === 'draft' ? 'arrow-up' : 'arrow-down'}
                iconStyling="text-text hover:text-success"
                action={handleUpdateStatus}
				confirmText="Voulez-vous changer le statut du quiz?"
				isLoading={updateIsPending}
            />
			<IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => {
                    onEdit(rowId)
                }}
            />
			<IconButton
                iconName="eye"
                iconStyling="text-text hover:text-success"
                action={() => {
					navigateTo(`${rowId}/quiz_question_detail`)
                }}
            />
            <IconButton
                iconName="question"
                iconStyling="text-text hover:text-success"
                action={() => {
                    navigateTo(`${rowId}/assign_quiz`);
                }}
            />
			<IconConfirmActionButton
				iconName="trash"
				iconStyling="text-text hover:text-error"
				action={handleDelQuiz}
				confirmText="Voulez-vous vraiment supprimer le quiz?"
				isLoading={isPending}
			/>
        </Box>
    );
};

const getQuizTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void
): Column<quizType>[] => [
	{
		header: 'Titre',
		key: "titre"
	},
	{
		header: 'Formation',
		key: "formation"
	},
	{
		header: 'Statut',
		key: "status",
		render: (value) => (
			<CustomText textTag="h6" className={`p-2 rounded-xl ${value === 'draft' ? 'bg-background' : 'bg-success-light'}` }>
				{ value === 'draft' ? 'Brouillon' : 'Publié'}
			</CustomText>
		)
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
		render: (value, row) => {
			return <ActionCell rowId={value ? value : ''} row={row ? row : null} onEdit={onEdit}/>
		}
		
	}
]

// Todo : Transform formation(id) to formation(name) and render with new quizType
const QuizList = () => {
	const [selectedUserId, setSelectedUserId] = useState<number>(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { getAllQuiz } = useQuiz()
	const { data: quizzes, status } = getAllQuiz

	if (status == 'pending')
		return <Loading />
	
	if (!quizzes)
		return <FetchError />
	
	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
        setSelectedUserId(id as number)
        setIsModalOpen(true)
    }

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={getQuizTabColumn(handleOpenEditModal)}
				data={quizzes}
				rowKey={'id'}
			/>
			<ModalQuizUpdate
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={selectedUserId}
			/>
		</Box>
	)
}

export default QuizList;