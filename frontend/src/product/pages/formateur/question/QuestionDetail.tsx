import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Box from "../../../../system/atoms/Container/Box";
import { useParams } from "react-router";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";

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
						color="primary"
						className={`${question.reponses.length == 0 ? '' : 'border-b'} border-background pb-3`}
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
												justify-start rounded-lg px-3 py-5
												${item.est_correct ? 'bg-success-light border border-success' : 'border border-background'}	
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
		</BodyLayout>
	)
}

export default QuestionDetail;