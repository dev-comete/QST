import { useQuestion, useQuestionDel, useQuestionRestore } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import { useState, type ChangeEvent } from "react"
import Select from "../../../atoms/Form/Select"
import { getSelectData } from "../../../../other/helper/helper"
import useDebounce from "../../../../other/hooks/question/useDebounce"
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"

const ActionCell = ({ questionId, listType }: { 
    rowId: string | number | boolean | string[]
	questionId: number
	listType?: string
}) => {    

	const { handleQuestionDel, isPending } = useQuestionDel(questionId)
	const { handleQuestionRestore, isPending : restorePending } = useQuestionRestore(questionId)

    return (
        <Box>
			{listType == 'bank' && 
				<>
					{/* <IconButton
						title="Modifier"
						iconName="edit"
						iconStyling="text-text hover:text-success"
						action={() => navigateTo('gestion_question/' + questionId + '/edit')}
					/> */}
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
	listType: string
): Column<bankQuestionType>[] => [

	{
		header: 'Enoncé',
		key: "enonce_question"
	},
	{
		header: null,
		key: 'id',
		render: (_val, row, index) => 
		<ActionCell
			rowId={index ? index : 0}
			questionId={Number(row?.id)}
			listType={listType}
		/>
	}
]

const QuestionList = ({ listType = 'bank'} : { listType?: 'bank' | 'trash'}) => {
	const [ search, setSearch ] = useState('')
	const [ type, setType ] = useState('')
	const [ page, setPage ] = useState(1)
	const [ pageSize, setPageSize ] = useState(5)
	const { debouncedValue, setDebouncedValue } = useDebounce(search, 500);
	const { list, questionTypeQuery } = useQuestion({ search : debouncedValue, type, page, pageSize, listType })
	const { data: questionsData, status } = list
	const { data : questionType, isPending } = questionTypeQuery

	const isLoading = status === 'pending' || isPending

	const { navigateTo } = useAppNavigation()
	const handleRowClick = listType === 'trash'
		? undefined
		: (row: bankQuestionType) => navigateTo('gestion_question/' + row.id)

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
			{!isLoading &&
				<>
					<Table
						columns={getQuestionTabColumn(listType)}
						data={questions ?? []}
						rowKey={'id'}
						onRowClick={handleRowClick}
						page={page}
						setPage={setPage}
						hasNextPage={next != null}
						emptyTitle={
							search.length === 0 ?
							listType == 'bank' ? "Il n'y a pas encore de question, veuillez en créer" : "La corbeille est vide"
							: "Aucune question ne correspond à votre recherche "
						}
						search={search}
						setSearch={setSearch}
						searchPlaceholder="Rechercher un mot-clé..."
						pageSize={pageSize}
						setPageSize={setPageSize}
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
									(debouncedValue || type !== '') &&
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
		</Box>
	)
}

export default QuestionList;