import { useQuestion, useQuestionDel } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
// import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"
import QuestionDetail from "../../../../product/pages/formateur/question/QuestionDetail"
import { useState, type Dispatch, type SetStateAction } from "react"
// import { useState } from "react"

const ActionCell = ({ rowId, setSelectedId }: { 
    rowId: string | number | boolean | string[]
	onEdit?: (id: string | number | boolean | string[]) => void
	setSelectedId: Dispatch<SetStateAction<number | null>>
}) => {    

	// const { navigateTo } = useAppNavigation()

	const { handleQuestionDel, isPending } = useQuestionDel(Number(rowId))
	

    return (
        <Box>
			<IconButton
                iconName="book"
                iconStyling="text-text hover:text-success"
                action={() => setSelectedId(Number(rowId))}
            />
			<IconConfirmActionButton
				iconName="trash"
				iconStyling="text-text hover:text-error"
				action={handleQuestionDel}
				confirmText="Voulez-vous vraiment supprimer la question?"
				isLoading={isPending}
			/>
        </Box>
    );
};

const getQuestionTabColumn = (
    // onEdit?: (id: string | number | boolean | string[]) => void,
	setSelectedId: Dispatch<SetStateAction<number | null>>
): Column<bankQuestionType>[] => [

// const questionTabColumn : Column<bankQuestionType>[] = [

	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: "Action",
		key: 'id',
		render: (_val, _row, index) => <ActionCell rowId={index ? index : 0} setSelectedId={setSelectedId} />
	}
]

const QuestionList = () => {

	const { list } = useQuestion()
	const { data: questions, status } = list

	// const [selectedId, setSelectedId] = useState<string>('')
	// const [isModalOpen, setIsModalOpen] = useState(false)

	// const handleOpenEditModal = (id: string | number | boolean | string[]) => {
	// 	setSelectedId(id as string)
	// 	setIsModalOpen(true)
	// }

	
	const [ selectedId, setSelectedId ] = useState<number | null>(null)
	
	if (status == "pending")
		return <Loading />

	if (!questions)
		return <FetchError />
	
	return (
		<Box direction="column" className="w-full items-center justify-center">
			{selectedId === null && <Table 
				columns={getQuestionTabColumn(setSelectedId)}
				data={questions}
				rowKey={'id'}
			/>}
			{ selectedId != null && 
				<QuestionDetail
					question={questions[selectedId]}
					setSelectedId={setSelectedId}
				/>
			}
		</Box>
	)
}

export default QuestionList;