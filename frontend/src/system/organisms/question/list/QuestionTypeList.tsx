import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import type { questionIdType } from "../../../../other/types/questionType"
import ModalQuestionTypeEdit from "../form/ModalQuestionTypeEdit"
import { useState } from "react"
import IconButton from "../../../molecules/Buttons/IconButton"

const ActionCell = ({ rowId, onEdit } : { 
	rowId: string | number | boolean | string[]
	onEdit: (id: string | number | boolean | string[]) => void
}) => {

    return (
        <Box>
			<IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => onEdit(rowId)}
				title="Modifier"
            />
        </Box>
    );
};

const getQuestionTypeTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void,
): Column<questionIdType>[] => [
	{
		header: 'ID',
		key: "id"
	},
	{
		header: 'Type de question',
		key: "type_question"
	},
	{
		header: 'Code',
		key: "code"
	},
	{
		header: null,
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} onEdit={onEdit} />
		}
		
	}
]

const QuestionTypeList = ({ questionTypes } : { questionTypes : questionIdType[]}) => {
	const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedQuestionType(id as string)
		setIsModalOpen(true)
	}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={getQuestionTypeTabColumn(handleOpenEditModal)}
				data={questionTypes}
				rowKey={'id'}
			/>
			<ModalQuestionTypeEdit
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={Number(selectedQuestionType)}
			/>
		</Box>
	)
}

export default QuestionTypeList;