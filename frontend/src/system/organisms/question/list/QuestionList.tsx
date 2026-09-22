import { useQuestion, useQuestionDel } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import QuestionDetail from "../../../../product/pages/formateur/question/QuestionDetail"
import { useState, type Dispatch, type SetStateAction } from "react"
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"

const ActionCell = ({ questionId }: { 
    rowId: string | number | boolean | string[]
	setSelectedId: Dispatch<SetStateAction<number | null>>
	questionId: number
}) => {    

	const { navigateTo } = useAppNavigation()

	const { handleQuestionDel, isPending } = useQuestionDel(questionId)

    return (
        <Box>
			<IconButton
				title="Modifier"
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => navigateTo('gestion_question/' + questionId + '/edit')}
            />
			<IconConfirmActionButton
				iconName="trash"
				iconStyling="text-text hover:text-error"
				action={handleQuestionDel}
				confirmText="Voulez-vous vraiment supprimer la question?"
				isLoading={isPending}
				title="Supprimer"
			/>
        </Box>
    );
};

const getQuestionTabColumn = (
	setSelectedId: Dispatch<SetStateAction<number | null>>
): Column<bankQuestionType>[] => [

	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: "Action",
		key: 'id',
		render: (_val, row, index) => <ActionCell
			rowId={index ? index : 0}
			setSelectedId={setSelectedId}
			questionId={Number(row?.id)}
		/>
	}
]

const QuestionList = () => {

	const { list } = useQuestion()
	const { data: questions, status } = list

	const [ selectedId, setSelectedId ] = useState<number | null>(null)
	
	if (status == "pending")
		return <Loading />

	if (!questions)
		return <FetchError />
	
	return (
		<Box direction="column" className="w-full items-center justify-center">
			{selectedId === null && 
				<Table 
					columns={getQuestionTabColumn(setSelectedId)}
					data={questions}
					rowKey={'id'}
					onRowClick={(_row, idx) => setSelectedId(idx)}
				/>
			}
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