import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import type { bankQuestionResp } from "../../../../other/types/questionType";
import type { QuestionQuiz } from "../../../../other/types/quizType";

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
									justify-start rounded-lg px-2 py-1
									${opt.est_correct ? 'bg-success-light' : 'bg-error-light'}	
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

	return (
		<>
			{ questions.length == 0
				? <CustomText className="w-full text-center">Veuillez assigner des questions au quiz</CustomText>
				: <Box direction="column" className="space-y-5 overflow-y-auto w-full">
				{
					questions.map((item, index) => {
						return (
							<Paper className="p-5" key={`ibloc-${item.question_id}-${index}`}>
								<Box direction="column" className="space-y-5"> 
									<Box className="justify-between border-b border-background pb-2">
										<CustomText
											textTag="h2"
											weight="bold"
											color="primary"
										>{index + 1}. {item.enonce_question}</CustomText>
										<Box className="space-x-2">
											<CustomText
												textTag="h6"
												weight="bold"
												className={`
													bg-text
													px-2 py-1 rounded-md
													text-white
												`}
											>{item.type_nom}</CustomText>
											<CustomText
												textTag="h6"
												weight="bold"
												className={`
													bg-success
													px-2 py-1 rounded-md
													text-white
												`}
											>{item.points} pts</CustomText>
										</Box>
									</Box>
									<OptionItem
										id={item.question_id}
										item={item.options}
									/>
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