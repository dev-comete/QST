import type { Dispatch, SetStateAction } from "react";
import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import IconButton from "../../../molecules/Buttons/IconButton";
import BaremeInput from "../../globalParam/input/BaremeInput";

interface QuizQuestionItemProps {
	numero: number,
	question : assignQuestionType,
	onBaremeChange: (value: string) => void;
    onDelete: () => void;
}

const QuizQuestionItem = ({ numero, question, onBaremeChange, onDelete } : QuizQuestionItemProps) => {

	return (
		<Paper className="flex flex-col w-full p-3 rounded-xl border border-background">
			<IconButton action={onDelete} iconName="circle-xmark" btnStyling="self-end"/>
			<Box direction="column">
				<CustomText>{`${numero}. ${question.texte_enonce}`}</CustomText>
				<BaremeInput onBaremeChange={onBaremeChange} />
			</Box>
		</Paper>
	)
}

interface QuizQuestionListProps {
	questions: assignQuestionType[]
	setQuestion: Dispatch<SetStateAction<assignQuestionType[]>>
}

const QuizQuestionList = ({questions, setQuestion} : QuizQuestionListProps) => {

    const handleDeleteQuestion = (indexToDelete: number) => {
        setQuestion(questions.filter((_, index) => index !== indexToDelete));
    };

    const handleBaremeChange = (indexToUpdate: number, newValue: string) => {
        const updatedQuestions = questions.map((q, index) => {
            if (index === indexToUpdate) {
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