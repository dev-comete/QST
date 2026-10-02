import type { Dispatch, SetStateAction } from "react";
import type { assignQuestionType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import IconButton from "../../../molecules/Buttons/IconButton";
import BaremeInput from "../../globalParam/input/BaremeInput";
import { QuizQuestionCard } from "../../../../product/pages/formateur/quizz/QuizQuestion";
import NumerotationBadge from "../../../molecules/Badge/NumerotationBadge";

interface QuizQuestionItemProps {
	numero: number,
	question : assignQuestionType,
	onBaremeChange: (value: string) => void;
    onDelete: () => void;
}

const QuizQuestionItem = ({ numero, question, onBaremeChange, onDelete } : QuizQuestionItemProps) => {

	return (
		<Paper className="flex flex-col w-full p-3 rounded-xl border border-background">
			<Box direction="column">
				<Box className="justify-between items-center">
					<Box className="space-x-2">
						<NumerotationBadge index={numero}/>
						<CustomText>{`${question.texte_enonce}`}</CustomText>
					</Box>
					<IconButton
						action={onDelete}
						iconName="circle-xmark"
						btnStyling="self-end text-error"
						iconSize="lg"
					/>
				</Box>
				<div className="w-full">
					<BaremeInput onBaremeChange={onBaremeChange} labelPosition="row" />
				</div>
			</Box>
		</Paper>
	)
}

interface QuizQuestionListProps {
	questions: assignQuestionType[]
	setQuestion: Dispatch<SetStateAction<assignQuestionType[]>>
	startCount: number
}

const QuizQuestionList = ({questions, setQuestion, startCount  } : QuizQuestionListProps) => {

    const handleDeleteQuestion = (indexToDelete: number) => {
        setQuestion(questions.filter((_, index) => index !== indexToDelete));
    };

	const handleBaremeChange = (indexToUpdate: number, newValue: string) => {
		const newPts = Number(newValue);
		const currentPts = questions[indexToUpdate]?.bareme_pts;
		if (currentPts === newPts) return;

		setQuestion((prev) => prev.map((q, index) => index === indexToUpdate ? { ...q, bareme_pts: newPts } : q));
	};

	return (
		<Box direction="column" className="w-full justify-center items-center text-center" >
			<Box className="bg-secondary justify-center rounded-xl w-full">
				<QuizQuestionCard
					title="Questions du quiz"
					value={startCount}
					icon="question"
					color="primary"
				/>
				<QuizQuestionCard
					title="Questions pour ajout"
					value={questions.length}
					icon="plus"
					color="primary"
				/>
			</Box>
			{
				questions.length == 0
					? <CustomText>Veuillez ajouter les questions à assigner au quiz</CustomText>
					: 
					<Box direction="column" className="w-full">
						{ questions.map((item, index) => 
							<QuizQuestionItem
								key={index + item.texte_enonce}
								numero={startCount + index + 1}
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