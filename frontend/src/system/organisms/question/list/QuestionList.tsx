import { useQuestion, useQuestionDel, useQuestionRestore } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import QuestionDetail from "../../../../product/pages/formateur/question/QuestionDetail"
import { useState, type Dispatch, type SetStateAction, type ChangeEvent } from "react"
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"
import Select from "../../../atoms/Form/Select"
import { getSelectData } from "../../../../other/helper/helper"
import useDebounce from "../../../../other/hooks/question/useDebounce"

const ActionCell = ({ questionId, listType }: { 
    rowId: string | number | boolean | string[]
	setSelectedId: Dispatch<SetStateAction<number | null>>
	questionId: number
	listType?: string
}) => {    

	const { navigateTo } = useAppNavigation()

	const { handleQuestionDel, isPending } = useQuestionDel(questionId)
	const { handleQuestionRestore, isPending : restorePending } = useQuestionRestore(questionId)

    return (
        <Box>
			{listType == 'bank' && 
				<>
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
				</>
			}
			{
				listType == 'trash' && <IconConfirmActionButton
					iconName="rotate-left"
					iconStyling="text-text hover:text-primary"
					action={handleQuestionRestore}
					confirmText="Voulez-vous vraiment restaurer la question?"
					isLoading={restorePending}
					title="Restaurer"
				/>

			}
        </Box>
    );
};

const getQuestionTabColumn = (
	setSelectedId: Dispatch<SetStateAction<number | null>>,
	listType: string
): Column<bankQuestionType>[] => [

	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: "Action",
		key: 'id',
		render: (_val, row, index) => 
		<ActionCell
			rowId={index ? index : 0}
			setSelectedId={setSelectedId}
			questionId={Number(row?.id)}
			listType={listType}
		/>
	}
]

const QuestionList = ({ listType = 'bank'} : { listType?: 'bank' | 'trash'}) => {
	const [ search, setSearch ] = useState('')
	const [ type, setType ] = useState('')
	const [ page, setPage ] = useState(1)
	const { debouncedValue, setDebouncedValue } = useDebounce(search, 500);
	const { list, questionTypeQuery } = useQuestion({ search : debouncedValue, type, page, listType })
	const { data: questionsData, status } = list
	const { data : questionType, isPending } = questionTypeQuery

	const isLoading = status === 'pending' || isPending

	const [ selectedId, setSelectedId ] = useState<number | null>(null)

	const resetFilters = () => {
		setSearch('')
		setDebouncedValue('')
		setType('')
		setPage(1)
	}

	if (!isLoading && (!questionsData || !questionType)) {
		return <FetchError />
	}

	const selectedType = questionType ? [
		{ id: 'all', value: 'Tous les types' },
		...getSelectData(questionType, 'code')
	] : [{ id: 'all', value: 'Tous les types' }]

	const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'Tous les types') setType('')
		else setType(value)
	}

	const { next, results: questions } = questionsData ?? {}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			{isLoading && <Loading />}
			{!isLoading && selectedId === null &&
				<>
					<Table
						columns={getQuestionTabColumn(setSelectedId, listType)}
						data={questions ?? []}
						rowKey={'id'}
						onRowClick={(_row, idx) => setSelectedId(idx)}
						page={page}
						setPage={setPage}
						hasNextPage={next != null}
						emptyTitle={
							search.length === 0 ?
							"Il n'y a pas encore de question, veuillez en créer"
							: "Aucune question ne correspond à votre recherche "
						}
						search={search}
						setSearch={setSearch}
						searchPlaceholder="Rechercher un mot-clé..."
						filters={
							<Box className="flex items-center self-start">
								<Select 
									id="type-question"
									name="type-question"
									selectionValue={selectedType}
									value={type === '' ? 'Tous' : type}
									handleChange={handleTypeChange}
								/>
								{
									debouncedValue &&
									<IconButton
										iconName={"close"}
										action={resetFilters}
										title="Réinitialiser"
									/>
								}
							</Box>
						}
					/>
				</>
			}
			{ !isLoading && selectedId != null && questions && questions[selectedId] && 
				<QuestionDetail
					question={questions[selectedId]}
					setSelectedId={setSelectedId}
				/>
			}
		</Box>
	)
}

export default QuestionList;