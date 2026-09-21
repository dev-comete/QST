import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import Box from "../../../../system/atoms/Container/Box";
import { useParams } from "react-router";
import { useQuestion } from "../../../../other/hooks/question/useQuestion";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";

const QuestionDetailPage = () => {

	const { id } = useParams()
	const { infoQuestionQuery } = useQuestion(id)

	if (infoQuestionQuery.isPending) return <Loading />

	if (!infoQuestionQuery.data) return <FetchError />

	const question = infoQuestionQuery.data

	return (
		<BodyLayout
			title={"Détails de la question"}
		>
			<CustomText
				textTag="h2"
				weight="bold"
				color="primary"
			>{question.enonce_question}</CustomText>
			{
				question.reponses.map((item, index) => {
					return (
						<Paper className="p-5" key={`ibloc-${item.id}-${index}`}>
							<Box
								direction="column"
								className="w-full"
							>
								<Box
									className={`
										justify-start rounded-lg px-2 py-1
										${item.est_correct ? 'bg-success-light' : 'bg-error-light'}	
									`}
								>
									<CustomText>{item.texte}</CustomText>
								</Box>
								{item.explication && <CustomText isItalic={true}>Explication : {item.explication}</CustomText>}
							</Box>
						</Paper>
					)
				})
			}
		</BodyLayout>
	)
}

export default QuestionDetailPage;