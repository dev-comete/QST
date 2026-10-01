import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import type { assignQuestionType, bankQuestionType } from "../../../../other/types/questionType";
import type { QuestionQuiz } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import CustomText from "../../../atoms/Text/CustomText";
import IconButton from "../../../molecules/Buttons/IconButton";
import { TableHeader, TablePagination } from "../../../atoms/Table/Table";
import Select from "../../../atoms/Form/Select";
import useDebounce from "../../../../other/hooks/question/useDebounce";
import { getSelectData } from "../../../../other/helper/helper";

interface QuestionItemProps {
	addQuestionToAssign: (e: React.MouseEvent<HTMLButtonElement>) => void,
	item: bankQuestionType,
	disabled: boolean
}

const QuestionItem = ({ addQuestionToAssign, item, disabled } : QuestionItemProps) => {
	return (
		<Paper className="flex border border-background justify-between gap-3 items-center p-3 w-full">
			<CustomText>{item.enonce_question}</CustomText>
			{
				!disabled &&
				<IconButton 
					iconName="circle-plus"
					action={addQuestionToAssign}
					className="text-primary"
					title="Ajouter"
					iconSize="lg"
				/>
			}
		</Paper>
	)
}

export interface QuizBankQuestionProps {
	ownedQuestions: QuestionQuiz[]
	questions: assignQuestionType[]
	setQuestion: Dispatch<SetStateAction<assignQuestionType[]>>
}

const QuizBankQuestion = ({ questions, setQuestion, ownedQuestions } : QuizBankQuestionProps) => {

	const [ search, setSearch ] = useState('')
	const [ type, setType ] = useState('')
	const [ page, setPage ] = useState(1)
	const [ pageSize, setPageSize ] = useState(5)
	const { debouncedValue, setDebouncedValue } = useDebounce(search, 500);
	const { list, questionTypeQuery } = useQuestion({ search : debouncedValue, type, page, pageSize, listType: 'bank' })
	const { data: bankQuestions, status } = list
	const { data : questionType, isPending } = questionTypeQuery

	const handleSelectQuestion = (selectedQuestion: assignQuestionType) => {
		setQuestion((prev) => [...prev, selectedQuestion]);
	};

	if (status == 'pending' || isPending)
		return <Loading />
	if (!bankQuestions || !questionType)
		return <FetchError />

	const hasNextPage = bankQuestions.next != null

	const selectedType = questionType ? [
		{ id: 'all', value: 'Tous les types' },
		...getSelectData(questionType, 'code')
	] : [{ id: 'all', value: 'Tous les types' }]

	const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'Tous les types') setType('')
		else setType(value)
	}

	const resetFilters = () => {
		setSearch('')
		setDebouncedValue('')
		setType('')
		setPage(1)
	}

	return (
		<Box direction="column" className="items-center">
			<TableHeader
				setSearch={setSearch}
				search={search}
				searchPlaceholder={'Rechercher une question...'}
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
			<Box direction="column" className="w-full h-[40vh] overflow-y-auto">
			{
				bankQuestions.results.length == 0
				? <CustomText>Toutes les questions sont déjà assignées au quiz</CustomText>
				:
				bankQuestions.results.map((item) => {
					const isSelected = 
						questions?.some((q) => q.id === item.id) || 
						ownedQuestions?.some((q) => q.question_id === item.id);

					return (
						<QuestionItem
							key={item.id}
							item={item}
							disabled={isSelected}
							addQuestionToAssign={(e) => {
									e.preventDefault()
									handleSelectQuestion(
										{
											id: item.id,
											texte_enonce: item.enonce_question,
											type_id: '',
											bareme_pts: 0
										}
									)
								}
							}
						/>
				)})
			}
			</Box>
			<TablePagination
				page={page}
				setPage={setPage}
				hasNextPage={hasNextPage}
				pageSize={pageSize}
				setPageSize={setPageSize}
			/>
		</Box>
	)
}

export default QuizBankQuestion;