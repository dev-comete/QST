import { useState } from "react";
import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import type { bankQuestionResp } from "../../../../other/types/questionType";
import type { QuestionQuiz } from "../../../../other/types/quizType";
import IconButton from "../../../../system/molecules/Buttons/IconButton";

const QuestionInfoDetail = ({ variant = 'type', content} : {
	variant?: string,
	content: string
}) => {
	return (
		<Paper
			color={variant == 'type' ? 'secondary' : 'success-light'}
			hasShadow
			className={`
					px-2 py-1 rounded-md flex items-center justify-center
				`}
		>
			<CustomText
				textTag="h5"
				weight="bold"
				color={variant == 'type' ? 'primary' : 'success'}
			>{content}</CustomText>
		</Paper>
	)
}

interface OptionItemProps {
	id: number,
	item : bankQuestionResp[],
}

const OptionItem = ({ item } : OptionItemProps) => {

	return (
		<Box direction="column" className="space-y-3 items-start">
			{
				item.map((opt, index) => {

					return (
						<Box
							direction="column"
							className="w-full"
							key={`${opt.id}-${index}`}
						>
							<Box
								className={`
									justify-start rounded-lg px-3 py-5
									${opt.est_correct ? 'bg-success-light border border-success' : 'border border-background'}	
								`}
							>
								<CustomText>{opt.texte}</CustomText>
							</Box>
							{opt.explication && <CustomText isItalic={true}>Explication : {opt.explication}</CustomText>}
						</Box>
					)
				})
			}
		</Box>
	)
}

interface QuizQuestionDetailProps {
	questions : QuestionQuiz[]
}

const QuizQuestionDetail = ({ questions } : QuizQuestionDetailProps) => {
	const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({});

	const toggleQuestion = (questionId: number) => {
		setOpenQuestions((prev) => ({
			...prev,
			[questionId]: !prev[questionId]
		}));
	};

	return (
		<>
			{ questions.length == 0
				? <CustomText className="w-full text-center">Veuillez assigner des questions au quiz</CustomText>
				: <Box direction="column" className="space-y-5 overflow-y-auto w-full">
				{
					questions.map((item, index) => {
						const isOpen = openQuestions[item.question_id] ?? true;

						return (
							<Paper className="p-5" key={`ibloc-${item.question_id}-${index}`}>
								<Box direction="column" className="space-y-5">
									<Box className="justify-between border-b border-background pb-2 items-center">
										<CustomText
											textTag="h2"
										>{index + 1}. {item.enonce_question}</CustomText>
										<Box className="space-x-2 items-center">
											<QuestionInfoDetail content={item.type_nom}/>
											<QuestionInfoDetail variant='pts' content={item.points + ' pts'}/>
											<IconButton 
												iconName={ isOpen ? 'chevron-up' : 'chevron-down'}
												action={() => toggleQuestion(item.question_id)}
												className="text-disabled"
											/>
										</Box>
									</Box>

									{isOpen && (
										<OptionItem
											id={item.question_id}
											item={item.options}
										/>
									)}
								</Box>
							</Paper>
						)
					})
				}
			</Box>
		}
		</>
	)
}

export default QuizQuestionDetail;