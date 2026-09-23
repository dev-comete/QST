import type { Question } from "../../../../other/types/quizType";
import type { AnswersMap } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";

interface SelectQuestionItemProps {
	question : Question,
	handleSelect: (optionId: string | number, typeCode: 'QCU' | 'QCM') => void,
	id: number,
	answers?: AnswersMap,
	isQCU: boolean
}

const SelectQuestionItem = ({ question, handleSelect, answers = {}, isQCU } : SelectQuestionItemProps) => {

	return (
		<Box direction="column" className="space-y-3 items-start">
			{
				question.options.map((r, index) => {
					const checked = (answers[String(question.question_id)] || []).includes(r.id);
					return (
						<Box key={`${r.id}-${index}`} className="items-center">
							<Box>
								<Input
									type={isQCU ? 'radio' : 'checkbox'}
									id={`q-${question.question_id}-opt-${r.id}`}
									name={`question_${question.question_id}`}
									onChange={() => handleSelect(r.id, isQCU ? 'QCU' : 'QCM')}
									checked={checked}
								/>
							</Box>
							<CustomText>{r.reponse}</CustomText>
						</Box>
					)
				})
			}
		</Box>
	)
}

interface QuizQuestionBlocProps {
	questions: Question[],
	answers?: AnswersMap,
	onToggle?: (questionId: string | number, optionId: string | number, typeCode: 'QCU' | 'QCM') => void
}

const QuizQuestionBloc = ({ questions, answers = {}, onToggle } : QuizQuestionBlocProps) => {

	return (
		<Box direction="column" className="space-y-5 overflow-y-auto">
			{
				questions.map((q, index) => {
					const isQCU = (q.type_question && ((q as any).type_question.code === 'QCU' || (q as any).type_question === 'QCU')) || false;
					return (
						<Paper className="p-5" key={`qbloc-${q.question_id}`}>
							<Box direction="column" className="space-y-5"> 
								<Box direction="column" className="items-start border-b border-background pb-2">
									<CustomText textTag="h2" weight="bold" color="primary">{index + 1}. {q.enonce}</CustomText>
									<CustomText textTag="h6" isItalic={true}>{isQCU ? "Sélectionnez une seule réponse." : "Sélectionnez une ou plusieurs réponses."}</CustomText>
								</Box>
								<SelectQuestionItem
									key={'question' + index + q.question_id}
									question={q}
									id={index}
									isQCU={isQCU}
									answers={answers}
									handleSelect={(optionId: string | number, typeCode: 'QCU' | 'QCM') => onToggle && onToggle(q.question_id, optionId, typeCode)}
								/>
							</Box>
						</Paper>
					)
				})
			}
		</Box>
	)
}

export default QuizQuestionBloc;