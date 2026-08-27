import type { Question } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import CustomText from "../../../atoms/Text/CustomText";


interface DisplayQuestionProps {
	question: Question,
	id: number
}

const DisplayQuestion = ({ question, id } : DisplayQuestionProps) => {
	return (
		<Paper>
			<Box>
				<Box>
					<CustomText>{id}</CustomText>
				</Box>
				<CustomText>{question.enonce}</CustomText>
			</Box>
		</Paper>
	)
}

interface SelectQuestionItemProps {
	question : Question,
	handleSelect: () => void,
	id: number
}

const SelectQuestionItem = ({ question, handleSelect} : SelectQuestionItemProps) => {
	return (
		<Paper className="p-5">
			<Box direction="column" className="space-y-3 items-center">
				{
					question.options.map((r, index) => {
						return (
							<Box key={`${r.id} + ${index}`} className="space-x-5">
								<Input type="checkbox" id="id" name="name" onChange={handleSelect}/>
								<CustomText>{r.reponse}</CustomText>
							</Box>
						)
					})
				}
			</Box>
		</Paper>
	)
}

interface QuizQuestionBlocProps {
	questions: Question[]
}

const QuizQuestionBloc = ({ questions } : QuizQuestionBlocProps) => {
	return (
		<Box direction="column" className="space-y-5 overflow-y-auto">
			{
				questions.map((q, index) => {
					return (
						<Box direction="column">
							<DisplayQuestion question={q} id={index} />
							<SelectQuestionItem
								key={'question' + index + q.question_id}
								question={q}
								id={index}
								handleSelect={() => console.log("go")}
							/>
						</Box>
					)
				})
			}
		</Box>
	)
}

export default QuizQuestionBloc;