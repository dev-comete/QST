import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useQuiz } from "../../../../other/hooks/quiz/useQuiz";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import type { bankQuestionResp } from "../../../../other/types/questionType";

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

const QuizQuestionDetail = () => {

	const { id } = useParams()

	const { infoQuestionQuiz } = useQuiz(Number(id))
	const { data : questions, isPending } = infoQuestionQuiz

	if (isPending) return <Loading />

	if (!questions) return  <FetchError />

	return (
		<BodyLayout
			title={"Détails du quiz "}
			defaultLinkBack={true}
		>

			{ questions.length == 0
				? <CustomText className="w-full text-center">Aucune question n'est assignée au quiz</CustomText>
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
		</BodyLayout>
	)
}

export default QuizQuestionDetail;