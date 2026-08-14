import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import type { QuizAssignManipProps } from "../form/QuizAssignForm";

const QuizQuestionItem = ({ numero, question } : { numero: number, question : assignQuestionType}) => {
	return (
		<Paper className="w-full">
			<CustomText>{`${numero}. ${question.texte_enonce}`}</CustomText>
		</Paper>
	)
}

const QuizQuestionList = ({questions, setQuestion} : QuizAssignManipProps) => {

	return (
		<>
			{
				questions.map((item, index) => 
					<QuizQuestionItem
						key={index + item.texte_enonce}
						numero={index + 1}
						question={item}
					/>
				)
			}
		</>
	)
}

export default QuizQuestionList;