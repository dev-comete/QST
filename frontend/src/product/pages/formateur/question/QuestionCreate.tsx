import { useState } from "react";
import { checkOptionValidation } from "../../../../other/helper/helper";
import { buildValidationCriteria, useQuestionCreate } from "../../../../other/hooks/question/useQuestionCreate";
import Paper from "../../../../system/atoms/Container/Paper";
import Info from "../../../../system/atoms/Form/Info";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import { EnonceForm } from "../../../../system/organisms/question/form/QuestionForm";
import RespCreatedList from "../../../../system/organisms/question/list/RespCreatedList";
import BodyLayout from "../../../layout/common/BodyLayout";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";
import type { respType } from "../../../../other/types/questionType";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";

interface QuestionCreateValidationProps {
	questionType : string,
	responses: respType[]
}

const QuestionCreateValidation = ({ questionType, responses } : QuestionCreateValidationProps) => {

	const criteria = buildValidationCriteria(responses, questionType)

	const {
		msg,
		correctMsg,
		falseMsg,
		currentCorrectCount,
		currentFalseCount,
		correctCount,
		falseCondition,
		falseCount,
		trueCondition
	} = criteria

	return (
		<Box direction="column" className="w-1/3">
			<Paper className="p-5 border-primary" hasShadow>
				<Box className="space-x-2 items-start">
					<Box direction="column" className="space-y-1 items-start">
						<Box>
							<FAIcon name="circle-exclamation" size="xl" className="text-primary"/>
							<CustomText
								color="primary"
								weight="bold"
								textTag="h3"
							>Critères de validation du type {questionType}</CustomText>
						</Box>
						{
							questionType === 'OUV'
							?
							<p>{msg}</p>
							:
							<Box direction="column">
								<p>{msg} <span className="font-bold underline">{correctMsg}</span> et <span className="font-bold underline">{falseMsg}</span></p>
								<Box className="space-x-2">
									<CustomText
										textTag="h6"
										color={trueCondition ? 'success' : 'error'}
										className={` border rounded-full p-2 ${trueCondition ? 'border-success bg-success-light' : 'border-error bg-error-light'}`}
									>Bonne réponse {currentCorrectCount}/{correctCount}</CustomText>
									<CustomText
										textTag="h6"
										color={falseCondition ? 'success' : 'error'}
										className={` border rounded-full p-2 ${falseCondition ? 'border-success bg-success-light' : 'border-error bg-error-light'}`}
									>Mauvaise réponse {currentFalseCount}/{falseCount}</CustomText>
								</Box>
							</Box>
						}
					</Box>
				</Box>
				</Paper>
			{
				questionType != 'OUV' &&
				<Paper className="p-5">
					<Box>
						<FAIcon name="circle-info" size="xl" className="text-primary"/>
						<CustomText
							color="primary"
							weight="bold"
							textTag="h3"
						>Instructions</CustomText>
					</Box>
					<ul className="list-disc pl-5 space-y-2">
						<li>Vous pouvez supprimer une réponse en cliquant sur le bouton 'x'.</li>
						<li>En cochant/décochant la case, vous pouvez choisir si la question est vraie ou fausse.</li>
						<li>Vous pouvez ajouter une réponse grâce au bouton 'Ajouter' en bas de la liste.</li>
						<li>Veillez à bien remplir les champs 'Enoncé' et 'Explication'.</li>
					</ul>
				</Paper>
			}
		</Box>
	)
}

const QuestionCreate = () => {

	const [ activeTab, setActiveTab ] = useState(0);

	const { 
		question,
		setQuestion,
		responses,
		setResponses,
		questionTypeQuery,
		handleCreate,
		isPending,
		errorForm,
		isOuvert,
		selectedQuestionType,
	} = useQuestionCreate()
	
	const { data: questionType, status: questionTypeStatus } = questionTypeQuery
	
	if (questionTypeStatus == 'pending') return <Loading />
	
	if (!questionType) return <FetchError />
	
	const handleSubmit = async(e: React.SubmitEvent) => {
		e.preventDefault()
		checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '')
		await handleCreate()
	}

	return (
		<BodyLayout
			title={"Création de question"}
			linkBack="gestion_question"
			titleButton={
				<ActionButton
					type="submit"
					form="createQuestion"
					disabled={question.enonce_question.length == 0 || !checkOptionValidation(responses, selectedQuestionType)}
					isLoading={isPending}
				>{"Créer la question"}</ActionButton>
			}
		>
			<Box direction="column">
				{errorForm.msg && <Info info={errorForm.msg} variant="error"/>}
				<form
					id="createQuestion"
					onSubmit={handleSubmit}
				>
					<NavigationBar
						titles={['Enoncé', 'Options']}
						activeTab={activeTab}
						onTabChange={(index) => setActiveTab(index)}
					>
						<Paper className="p-5 w-2/3 m-auto">
							<EnonceForm
								question={question}
								setQuestion={setQuestion}
								questionType={questionType}
							/>
						</Paper>
							<Box className="items-start justify-start gap-4">
							<QuestionCreateValidation 
								questionType={selectedQuestionType}
								responses={responses}
							/>
							{
								!isOuvert && 
									<Paper className="p-5 min-w-0 flex-1">
										<RespCreatedList 
											responses={responses}
											setResponses={setResponses}
										/>
								</Paper>
							}
						</Box>
					</NavigationBar>
				</form>
			</Box>
		</BodyLayout>
	)
}

export default QuestionCreate;