import { useState } from "react";
import { checkOptionValidation } from "../../../../other/helper/helper";
import { useQuestionCreate } from "../../../../other/hooks/question/useQuestionCreate";
import Paper from "../../../../system/atoms/Container/Paper";
import Info from "../../../../system/atoms/Form/Info";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import NavigationBar from "../../../../system/molecules/Navigation/NavigationBar";
import { EnonceForm } from "../../../../system/organisms/question/form/QuestionForm";
import RespCreatedList from "../../../../system/organisms/question/list/RespCreatedList";
import BodyLayout from "../../../layout/common/BodyLayout";

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
	} = useQuestionCreate()
	
	const { data: questionType, status: questionTypeStatus } = questionTypeQuery
	
	if (questionTypeStatus == 'pending') return <Loading />
	
	if (!questionType) return <FetchError />
	
	const handleSubmit = async(e: React.SubmitEvent) => {
		e.preventDefault()
		checkOptionValidation(responses, questionType.find(q => q.id == question.type_id)?.code || '')
		await handleCreate()
	}
	
	const addResponse = () => {
		setResponses((prev) => [
			...prev,
			{
				reponse: '',
				est_correct: false,
				explication: ''
			}
		]);
	}
	
	return (
		<BodyLayout
			title={"Création de question"}
			linkBack="gestion_question"
			titleButton={
				<ActionButton
					type="submit"
					form="createQuestion"
					disabled={question.enonce_question.length == 0}
					isLoading={isPending}
				>{"Créer la question"}</ActionButton>
			}
		>

			<form
				id="createQuestion"
				onSubmit={handleSubmit}
			>
				<NavigationBar
					titles={['Enoncé', 'Options']}
					activeTab={activeTab}
					onTabChange={(index) => setActiveTab(index)}
				>
					<Paper className="p-5">
						<EnonceForm
							question={question}
							setQuestion={setQuestion}
							questionType={questionType}
						/>
						{errorForm.type != 'response' && errorForm.msg && <Info info={errorForm.msg} variant="error"/>}
					</Paper>
					{
						isOuvert ? 
							<Info info={'Une question ouverte ne nécessite pas de proposition de réponses'} />
						:
						<>
							<RespCreatedList 
								responses={responses}
								setResponses={setResponses}
								errorMsg={errorForm.type == 'response' ? errorForm.msg : null}
							/>
							<ActionButton onClick={addResponse}>{"+ Réponse"}</ActionButton>
						</>
					}
				</NavigationBar>
			</form>
		</BodyLayout>
	)
}

export default QuestionCreate;