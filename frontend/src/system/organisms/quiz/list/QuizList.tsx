import { useState } from "react";
import { formatDate } from "../../../../other/helper/helper";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import { useQuiz, useQuizDel, useQuizUpdate } from "../../../../other/hooks/quiz/useQuiz";
import type { quizType } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { Table, type Column } from "../../../atoms/Table/Table";
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import ModalQuizUpdate from "../form/ModalQuizUpdate";
import StatusTag from "../tag/StatusTag";
import { useFormAction } from "react-router";
import { useFormation } from "../../../../other/hooks/formation/useFormation";

const ActionCell = ({ rowId, row, onEdit } : {
	rowId : string | number | boolean,
	row: quizType | null
	onEdit: (id: string | number | boolean | string[]) => void 
}) => {
	const { handleDelQuiz, isPending } = useQuizDel(Number(rowId))
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(rowId), row ? row.status : 'draft')

    return (
        <Box>
			<IconConfirmActionButton
                iconName={row && row.status === 'draft' ? 'arrow-up' : 'arrow-down'}
                iconStyling="text-text hover:text-warning"
                action={handleUpdateStatus}
				confirmText="Voulez-vous changer le statut du quiz?"
				isLoading={updateIsPending}
            />
			<IconButton
                iconName="edit"
				title="Modifier"
                iconStyling="text-text hover:text-success"
                action={() => {
                    onEdit(rowId)
                }}
            />
			<IconConfirmActionButton
				iconName="trash"
				title="Supprimer"
				iconStyling="text-text hover:text-error"
				action={handleDelQuiz}
				confirmText="Voulez-vous vraiment supprimer le quiz?"
				isLoading={isPending}
			/>
        </Box>
    );
};

const QuizList = () => {
	const [selectedUserId, setSelectedUserId] = useState<number>(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { getAllQuiz } = useQuiz()
	const { data: quizzes, status } = getAllQuiz
	const { navigateTo } = useAppNavigation();
	const { formations } = useFormation()

	if (status == 'pending')
		return <Loading />
	
	if (!quizzes || !formations)
		return <FetchError />
	
	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
        setSelectedUserId(id as number)
        setIsModalOpen(true)
    }

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
			render: (value) => <StatusTag status={String(value)}/>
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
	

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={getQuizTabColumn(handleOpenEditModal)}
				data={quizzes}
				rowKey={'id'}
				onRowClick={(row) => navigateTo(`${row.id}/quiz_questions`)}
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