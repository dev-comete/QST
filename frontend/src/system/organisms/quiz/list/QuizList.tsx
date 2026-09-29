import { useState } from "react";
import { formatDate } from "../../../../other/helper/helper";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import { useQuiz, useQuizDel, useQuizRestore, useQuizUpdate } from "../../../../other/hooks/quiz/useQuiz";
import type { quizType } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { Table, type Column } from "../../../atoms/Table/Table";
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import ModalQuizEdit from "../form/ModalQuizEdit";
import { QuizStatusTag } from "../tag/StatusTag";
import { useFormation } from "../../../../other/hooks/formation/useFormation";

const ActionCell = ({ rowId, row, onEdit, listType } : {
	rowId : string | number | boolean,
	row: quizType | null
	onEdit: (id: string | number | boolean | string[]) => void
	listType: string
}) => {
	const { handleDelQuiz, isPending } = useQuizDel(Number(rowId))
	const { handleRestoreQuiz, isPending : restorePending } = useQuizRestore(Number(rowId))
	const { handleUpdateStatus, isPending : updateIsPending } = useQuizUpdate(Number(rowId), row ? row.status : 'draft')

    return (
        <Box>
			{
				listType == 'trash' &&
				<IconConfirmActionButton
					iconName={'rotate-left'}
					iconStyling="text-text hover:text-primary"
					action={handleRestoreQuiz}
					confirmText="Voulez-vous vraiment restaurer le quiz?"
					isLoading={restorePending}
					title={'Restaurer'}
				/>
			}
			{
				listType == 'default' &&
				<>
					<IconConfirmActionButton
						iconName={row && row.status === 'draft' ? 'arrow-up' : 'arrow-down'}
						iconStyling="text-text hover:text-primary"
						action={handleUpdateStatus}
						confirmText="Voulez-vous changer le statut du quiz?"
						isLoading={updateIsPending}
						title={row && row.status === 'draft' ? 'Publier' : 'Retirer'}
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
				</>
			}
        </Box>
    );
};

const QuizList = ({ listType = 'default' } : { listType?: string }) => {
	const [selectedUserId, setSelectedUserId] = useState<number>(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { getAllQuiz } = useQuiz({listType})
	const { data: quizzes, status } = getAllQuiz
	const { navigateTo } = useAppNavigation();
	const { formations, formationsStatus } = useFormation()

	if (status == 'pending' || formationsStatus == 'pending' )
		return <Loading />
	
	if (!quizzes || !formations)
		return <FetchError />
	
	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
        setSelectedUserId(id as number)
        setIsModalOpen(true)
    }

	const getQuizTabColumn = (
		onEdit: (id: string | number | boolean | string[]) => void,
		listType: string
	): Column<quizType>[] => [
		{
			header: 'Titre',
			key: "titre"
		},
		{
			header: 'Formation',
			key: "formation",
			render: (value) => formations.find((f) => value == f.id)?.nom_formation
		},
		{
			header: 'Statut',
			key: "status",
			render: (value) => <QuizStatusTag status={String(value)}/>
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
			header: null,
			key: 'id',
			render: (value, row) => {
				return <ActionCell
					rowId={value ? value : ''}
					row={row ? row : null}
					onEdit={onEdit}
					listType={listType}
				/>
			}
			
		}
	]
	

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={getQuizTabColumn(handleOpenEditModal, listType)}
				data={quizzes}
				rowKey={'id'}
				onRowClick={(row) => navigateTo(`${row.id}/quiz_questions`)}
			/>
			<ModalQuizEdit
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={selectedUserId}
			/>
		</Box>
	)
}

export default QuizList;