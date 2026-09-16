import { useQuestionCreate } from "../../../../other/hooks/question/useQuestionCreate";
import Box from "../../../atoms/Container/Box";
import Title from "../../../molecules/LayoutElement/Title";
import TextArea from "../../../atoms/Form/TextArea";
import Select from "../../../atoms/Form/Select";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import RespCreatedList from "../list/RespCreatedList";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import BaremeInput from "../../globalParam/input/BaremeInput";
import type { Dispatch, SetStateAction } from "react";
import type { questionIdType, questionType } from "../../../../other/types/questionType";

interface EnonceFormProps {
	question: questionType
	setQuestion: Dispatch<SetStateAction<questionType>>
	questionType: questionIdType[]
}

const EnonceForm = ({ question, setQuestion, questionType} : EnonceFormProps) => {

	const selectionQuestionType = getSelectData(questionType, 'code')

	return (
		<Box direction="column" className="w-full px-5 space-y-5">
			<Title title="Enoncé" />
			<TextArea
				id={"enonce"}
				name={"enonce"}
				label="Enoncé"
				value={question.enonce_question}
				onChange={formChangeHandler(setQuestion, 'enonce_question')}
				required={true}
				placeholder="Exemple: Comment parler à un client ?"
			/>
			<Box className="w-full gap-2">
				<Box className="min-w-0 flex-1">
					<Select
						id={"type"}
						name={"type"}
						selectionValue={selectionQuestionType}
						label="Type de question"
						handleChange={formChangeHandler(setQuestion, 'type_id', (value) => {
							const selected = selectionQuestionType.find((q) => q.value === value) ?? selectionQuestionType[0]
							const realId = Number(selected.id)
							return realId + 1
						})}
					/>
				</Box>
				<Box className="min-w-0 flex-1">
					<BaremeInput onBaremeChange={() => formChangeHandler(setQuestion, 'bareme_pts')} />
				</Box>
			</Box>
		</Box>
	)
}


const QuestionForm = () => {

	const { question, setQuestion, responses, setResponses, questionTypeQuery, handleCreate, isPending } = useQuestionCreate()
	const { data: questionType, status: questionTypeStatus } = questionTypeQuery

	if (questionTypeStatus == 'pending') return <Loading />

	if (!questionType) return <FetchError />

	const handleSubmit = async(e: React.SubmitEvent) => {
		e.preventDefault()
		await handleCreate()
	}

	return (
		<form
			id="createQuestion"
			onSubmit={handleSubmit}
			className="flex flex-col justify-center items-center w-3/4 mx-auto space-y-5"
		>
			<EnonceForm
				question={question}
				setQuestion={setQuestion}
				questionType={questionType}
			/>
			<Title
				title="Réponses"
				sideButton={
					<ActionButton
						onClick={(e) => {e.preventDefault()}}
					>{"+ Réponse"}</ActionButton>
				}
			/>
			<RespCreatedList 
				responses={responses}
				setResponses={setResponses}
			/>
			<ActionButton
				type="submit"
				form="createQuestion"
				disabled={question.enonce_question.length == 0 || question.options.length < 2}
				isLoading={isPending}
			>{"Créer question"}</ActionButton>
		</form>
	)
}

export default QuestionForm;