import { getSelectData, type SelectOption } from "../../../../other/helper/helper";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import CustomText from "../../../atoms/Text/CustomText";
import type { QuizAssignManipProps } from "../form/QuizAssignForm";

interface QuizQuestionItemProps {
	numero: number,
	question : assignQuestionType,
	baremes_pts: SelectOption[]
}

const QuizQuestionItem = ({ numero, question, baremes_pts } : QuizQuestionItemProps) => {

	return (
		<Paper className="w-full p-3 rounded-xl" color="background">
			
			<Box direction="column">
				<CustomText>{`${numero}. ${question.texte_enonce}`}</CustomText>
				<Select 
					id={"type"}
					name={"type"}
					selectionValue={baremes_pts}
					label="Barème"
					handleChange={
						() => console.log("Change bareme")
					}
				/>
			</Box>
		</Paper>
	)
}

const QuizQuestionList = ({questions, setQuestion} : QuizAssignManipProps) => {

	const { baremeQuery } = useQuestion()

	if (baremeQuery.status == 'pending')
		return <Loading />
	
	if (!baremeQuery.data)
		return <FetchError />

	return (
		<Box direction="column" className="w-full justify-center items-center text-center" >
			{
				questions.length == 0
					? <CustomText>Veuillez sélectionner les questions pour le quiz</CustomText>
					: 
					<Box direction="column">
						<CustomText isItalic={true}>{`Nombre de questions : ${questions.length}`}</CustomText>
						{ questions.map((item, index) => 
							<QuizQuestionItem
								key={index + item.texte_enonce}
								numero={index + 1}
								question={item}
								baremes_pts={getSelectData(baremeQuery.data, 'pts')}
							/>
						)}
					</Box>
			}
		</Box>
	)
}

export default QuizQuestionList;