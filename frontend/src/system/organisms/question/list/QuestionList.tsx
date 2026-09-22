import { useQuestion, useQuestionDel } from "../../../../other/hooks/question/useQuestion"
import type { bankQuestionType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import QuestionDetail from "../../../../product/pages/formateur/question/QuestionDetail"
import { useState, type Dispatch, type SetStateAction, type ChangeEvent } from "react"
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"
import Input from "../../../atoms/Form/Input"
import CustomText from "../../../atoms/Text/CustomText"
import Select from "../../../atoms/Form/Select"
import { getSelectData } from "../../../../other/helper/helper"

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
	const [ search, setSearch ] = useState('')
	const [ type, setType ] = useState('')
	const [ page, setPage ] = useState(1)
	const { list, questionTypeQuery } = useQuestion({ search, type, page })
	const { data: questions, status } = list
	const { data : questionType, isPending } = questionTypeQuery

	const [ selectedId, setSelectedId ] = useState<number | null>(null)
	const [ localSearch, setLocalSearch] = useState('')

	const handleSearch = () => {
		setSearch(localSearch)
	}

	const resetFilters = () => {
		setSearch('')
		setType('')
		setPage(1)
	}
	
	if (status == "pending" || isPending)
		return <Loading />

	if (!questions || !questionType)
		return <FetchError />

	const selectedType = [
		{ id: 'all', value: 'Tous les types' },
		...getSelectData(questionType, 'code')
	]

	const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'Tous les types') setType('')
		else setType(value)
	}
	
	return (
		<Box direction="column" className="w-full items-center justify-center">
			{selectedId === null &&
				<>
					{/* Filters */}
					<Box className="flex items-center self-start w-2/3">
						<Input
							id={"searchQuestion"}
							name={"searchQuestion"}
							type="search"
							onChange={(e) => setLocalSearch(e.target.value)}
							endIcon={
								<IconButton
									iconName={"search"}
									action={handleSearch}
									iconStyling="text-text"
								/>
							}				
						/>
						<Select 
							id="type-question"
							name="type-question"
							selectionValue={selectedType}
							value={type === '' ? 'Tous' : type}
							handleChange={handleTypeChange}
						/>
						<IconButton
							iconName={"close"}
							action={resetFilters}
							title="Réinitialiser"
						/>
					</Box>

					{/* Table */}
					<Table 
						columns={getQuestionTabColumn(setSelectedId)}
						data={questions}
						rowKey={'id'}
						onRowClick={(_row, idx) => setSelectedId(idx)}
						emptyTitle={
							search.length === 0 ?
							"Il n'y a pas encore de question, veuillez en créer"
							: "Aucune question ne correspond à votre recherche "
						}
					/>
				</>
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