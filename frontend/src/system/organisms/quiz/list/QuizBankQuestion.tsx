import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import type { assignQuestionType, bankQuestionType } from "../../../../other/types/questionType";
import Paper from "../../../atoms/Container/Paper";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import CustomText from "../../../atoms/Text/CustomText";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import type { QuizAssignManipProps } from "../form/QuizAssignForm";


interface QuestionItemProps {
	addQuestionToAssign: (e: React.MouseEvent<HTMLButtonElement>) => void,
	item: bankQuestionType,
	disabled: boolean
}

const QuestionItem = ({ addQuestionToAssign, item, disabled } : QuestionItemProps) => {
	return (
		<Paper className="flex border border-background justify-between gap-3 items-center p-3">
			<CustomText>{item.enonce_question}</CustomText>
			{
				!disabled &&
				<ActionButton
					onClick={addQuestionToAssign}
					btnColor={"text"}
					textColor="white"
					disabled={disabled}
				>Ajouter</ActionButton>
			}
		</Paper>
	)
}


const QuizBankQuestion = ({ questions, setQuestion } : QuizAssignManipProps) => {

	const { getAllQuestion } = useQuestion()
	const { data: bankQuestions, status } = getAllQuestion

	const handleSelectQuestion = (selectedQuestion: assignQuestionType) => {
		setQuestion((prev) => [...prev, selectedQuestion]);
	};

	if (status == 'pending')
		return <Loading />
	if (!bankQuestions)
		return <FetchError />

	return (
		<>
			{
				bankQuestions.map((item) => {
					const isSelected = questions?.some((q) => q.id === item.id);

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
		</>
	)
}

export default QuizBankQuestion;