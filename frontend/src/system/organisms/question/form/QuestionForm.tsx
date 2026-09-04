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


const EnonceForm = () => {

	const { question, setQuestion, questionTypeQuery, baremeQuery  } = useQuestionCreate();
	const { data : questionType, status : questionTypeStatus } = questionTypeQuery
	const { data : bareme, status : baremeStatus } = baremeQuery

	if (questionTypeStatus == 'pending' || baremeStatus == 'pending')
		return <Loading />
	
	if (!questionType || !bareme)
		return <FetchError />

	const selectionQuestionType = getSelectData(questionType, 'code')
	const selectionBareme = getSelectData(bareme, 'pts')

	return (
		<Box direction="column" className="w-full px-5">
			<Title title="Enoncé" />
			<TextArea
				id={"enonce"}
				name={"enonce"}
				label="Enoncé"
				value={question.enonce_question}
				onChange={formChangeHandler(setQuestion, 'enonce_question')}
			/>
			<Select
				id={"type"}
				name={"type"}
				selectionValue={selectionQuestionType}
				label="Type"
				handleChange={formChangeHandler(setQuestion, 'type_id', (value) => {
					const selected = selectionQuestionType.find((q) => q.value === value) ?? selectionQuestionType[0]
					return Number(selected.id)
				})}
			/>
			<Select
				id={"bareme"}
				name={"bareme"}
				selectionValue={selectionBareme}
				label="Barème"
				handleChange={formChangeHandler(setQuestion, 'bareme_pts')}
			/>
		</Box>
	)
}


const QuestionForm = ({ openRespForm } : { openRespForm : () => void}) => {

	const { handleCreate } = useQuestionCreate()

	return (
		<form
			id="createQuestion"
			onSubmit={handleCreate}
			className="flex flex-col justify-center items-center gap-5 w-3/4 mx-auto"
		>
			<EnonceForm />
			<Title
				title="Réponse"
				sideButton={
					<ActionButton
						onClick={(e) => {e.preventDefault() ; openRespForm()}}
					>{"+ Réponse"}</ActionButton>
				}
			/>
			<RespCreatedList />
			<ActionButton
				type="submit"
				form="createQuestion"
			>{"Créer question"}</ActionButton>
		</form>
	)
}

export default QuestionForm;