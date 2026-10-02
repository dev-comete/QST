import type { Question } from "../../../../other/types/quizType";
import type { AnswersMap } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";
import NumerotationBadge from "../../../molecules/Badge/NumerotationBadge";

interface SelectQuestionItemProps {
	question : Question,
	handleSelect: (optionId: string | number, typeCode: 'QCU' | 'QCM' | 'OUV') => void,
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
	onToggle?: (questionId: string | number, optionId: string | number, typeCode: 'QCU' | 'QCM' | 'OUV') => void
}

const QuizQuestionBloc = ({ questions, answers = {}, onToggle } : QuizQuestionBlocProps) => {

	const getQuestionTypeCode = (question: Question) => {
		if (typeof question.type_question === 'string') return question.type_question;
		return question.type_question?.code ?? '';
	};

	return (
		<Box direction="column" className="space-y-3 overflow-y-auto">
			{
				questions.map((q, index) => {
					const typeCode = getQuestionTypeCode(q);
					const isQCU = typeCode === 'QCU';
					const isOuvert = typeCode === 'OUV';
					// const openValue = (answers[String(q.question_id)] || []).join('');
					
					return (
						<Paper className="p-5" key={`qbloc-${q.question_id}`}>
							<Box direction="column" className="space-y-5"> 
								<Box direction="column" className="items-start border-b border-background pb-2 space-y-2">
									<Box className="items-center space-x-2">
										<NumerotationBadge index={index + 1}/>
										<CustomText
											textTag="h2"
											weight="bold"
										>{q.enonce}</CustomText>
									</Box>
									<CustomText textTag="h6" isItalic={true}>
										{isOuvert ? "Saisissez votre réponse." : (isQCU ? "Sélectionnez une seule réponse." : "Sélectionnez une ou plusieurs réponses.")}
									</CustomText>
								</Box>
								{
									isOuvert
									? 
									// <Input
									// 	id={`q-${q.question_id}-open`}
									// 	name={`question_${q.question_id}`}
									// 	value={openValue}
									// 	placeholder="Votre réponse"
									// 	onChange={(e) => onToggle && onToggle(q.question_id, e.target.value, 'OUV')}
									// />
									null
									:
									<SelectQuestionItem
										key={'question' + index + q.question_id}
										question={q}
										id={index}
										isQCU={isQCU}
										answers={answers}
										handleSelect={(optionId: string | number, typeCode: 'QCU' | 'QCM' | 'OUV') => onToggle && onToggle(q.question_id, optionId, typeCode)}
									/>
								}
							</Box>
						</Paper>
					)
				})
			}
		</Box>
	)
}

export default QuizQuestionBloc;