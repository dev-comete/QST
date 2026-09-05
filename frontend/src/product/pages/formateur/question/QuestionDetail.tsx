import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Box from "../../../../system/atoms/Container/Box";
import type { bankQuestionType } from "../../../../other/types/questionType";
import type { Dispatch, SetStateAction } from "react";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";

interface QuestionDetailProps {
	question: bankQuestionType
	setSelectedId: Dispatch<SetStateAction<number | null>>
}

const QuestionDetail = ({ question, setSelectedId } : QuestionDetailProps) => {

	return (
		<div className="flex flex-col gap-5 w-full">
			<ActionButton
				btnColor="text"
				onClick={() => setSelectedId(null)}
			>Retour</ActionButton>
			<Paper className="p-5">
				<Box direction="column" className="space-y-3">
					<CustomText
						textTag="h2"
						weight="bold"
						color="primary"
					>{question.enonce_question}</CustomText>
					{
						question.reponses.map((item, index) => {
							return (
									<Box
										key={`ibloc-${item.id}-${index}`}
										direction="column"
										className="w-full"
									>
										<Box
											className={`
												justify-start rounded-lg px-2 py-1
												${item.est_correct ? 'bg-success-light' : 'border border-background'}	
											`}
										>
											<CustomText>{item.texte}</CustomText>
										</Box>
										{item.explication && <CustomText isItalic={true}>Explication : {item.explication}</CustomText>}
									</Box>
							)
						})
					}
				</Box>
			</Paper>
		</div>
	)
}

export default QuestionDetail;