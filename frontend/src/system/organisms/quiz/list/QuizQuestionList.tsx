import { getSelectData, type SelectOption } from "../../../../other/helper/helper";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import CustomText from "../../../atoms/Text/CustomText";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import type { QuizAssignManipProps } from "../form/QuizAssignForm";

interface QuizQuestionItemProps {
	numero: number,
	question : assignQuestionType,
	baremes_pts: SelectOption[],
	onBaremeChange: (value: string) => void;
    onDelete: () => void;
}

const QuizQuestionItem = ({ numero, question, baremes_pts, onBaremeChange, onDelete } : QuizQuestionItemProps) => {

	return (
		<Paper className="w-full p-3 rounded-xl" color="background">
			<ActionButton
				action={onDelete}
			>x</ActionButton>
			<Box direction="column">
				<CustomText>{`${numero}. ${question.texte_enonce}`}</CustomText>
				<Select 
					id={"type"}
					name={"type"}
					selectionValue={baremes_pts}
					label="Barème"
					handleChange={(e: any) => onBaremeChange(e.target.value)}
				/>
			</Box>
		</Paper>
	)
}

const QuizQuestionList = ({questions, setQuestion} : QuizAssignManipProps) => {

	const { baremeQuery } = useQuestion()
	const { data: baremes, status } = baremeQuery

	if (status == 'pending')
		return <Loading />
	
	if (!baremes)
		return <FetchError />

    const handleDeleteQuestion = (indexToDelete: number) => {
        setQuestion(questions.filter((_, index) => index !== indexToDelete));
    };

    const handleBaremeChange = (indexToUpdate: number, newValue: string) => {
        const updatedQuestions = questions.map((q, index) => {
            if (index === indexToUpdate) {
				console.log("New value bareme ", newValue)
                return { ...q, bareme_pts: Number(newValue) };
            }
            return q;
        });
        setQuestion(updatedQuestions);
    };

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
								baremes_pts={getSelectData(baremes, 'pts')}
								onBaremeChange={(newValue : string) => handleBaremeChange(index, newValue)}
								onDelete={() => handleDeleteQuestion(index)}
							/>
						)}
					</Box>
			}
		</Box>
	)
}

export default QuizQuestionList;