import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Box from "../../../../system/atoms/Container/Box";
import { useParams } from "react-router";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import type { bankQuestionResp } from "../../../../other/types/questionType";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";

interface OptionItemProps {
	id: number,
	item : bankQuestionResp[],
}

export const OptionItem = ({ item } : OptionItemProps) => {

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
									justify-between rounded-lg px-3 py-5
									${opt.est_correct ? 'bg-success-light border border-success' : 'border border-background'}	
								`}
							>
								<CustomText>{opt.texte}</CustomText>
								<FAIcon
									name={opt.est_correct ? 'circle-check' : ''}
									className={opt.est_correct ? 'text-success' : 'text-error'}
								/>
							</Box>
							{
								opt.explication &&
								<Box
									className={`
										justify-start rounded-xl px-3 py-5 bg-secondary pl-5
									`}
								>
									<CustomText isItalic>Explication : {opt.explication}</CustomText>
								</Box>
							}
						</Box>
					)
				})
			}
		</Box>
	)
}

const QuestionDetail = () => {

	const { id } = useParams()
	const { infoQuestionQuery } = useQuestion({id})
	const { data : question, isPending } = infoQuestionQuery
	console.log("Id", id)

	if (isPending) return <Loading />

	if (!question) return <FetchError />

	return (
		<BodyLayout
			title={"Détails de la question"}
			defaultLinkBack
		>
			<Paper className="p-5">
				<Box direction="column" className="space-y-3">
					<CustomText
						textTag="h2"
						weight="bold"
						className={`${question.reponses.length == 0 ? '' : 'border-b'} border-background pb-3`}
					>{question.enonce_question}</CustomText>
					<OptionItem id={question.id} item={question.reponses}/>
				</Box>
			</Paper>
		</BodyLayout>
	)
}

export default QuestionDetail;