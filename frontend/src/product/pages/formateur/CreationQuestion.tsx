import { useState, type ChangeEvent } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import { useCreateQuestion } from "../../../other/hooks/useQuestion";
import type { respType } from "../../../other/types/questionType";
import BodyLayout from "../../layout/common/BodyLayout";
import Box from "../../../system/atoms/Container/Box";
import TextArea from "../../../system/atoms/Form/TextArea";
import Select from "../../../system/atoms/Form/Select";
import ResponseMakingList from "../../../system/molecules/List/ResponseMaking";
import CustomText from "../../../system/atoms/Text/CustomText";

const EnonceForm = () => {

	const { question, setQuestion, questionTypeQuery, baremeQuery  } = useCreateQuestion();
	const { data : questionType, status : questionTypeStatus } = questionTypeQuery
	const { data : bareme, status : baremeStatus } = baremeQuery

	if (questionTypeStatus == 'pending' || baremeStatus == 'pending')
		return <div>Chargement en cours....</div>
	
	if (!questionType || !bareme)
		return <div>Erreur....</div>

	const selectionQuestionType = questionType.map((item, idx) => (
		{id: String(idx), value: item.code}
	))

	const selectionBareme = bareme.map((item, idx) => (
		{ id: String(idx), value: item.pts}
	))

	const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		let selectedQuestionType = questionType.find(q => q.code === value)
		if (!selectedQuestionType)
			selectedQuestionType = questionType[0]
		setQuestion((prev) => ({ ...prev, type_id: selectedQuestionType.id }));
	};

	const handleBaremeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setQuestion((prev) => ({ ...prev, bareme_pts: Number(value) }));
	};

	const handleEnonceChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value;
		setQuestion((prev) => ({ ...prev, enonce_question: value }));
	};

	return (
		<Box direction="column" customStyling="w-full px-5">
			<TextArea
				id={"enonce"}
				name={"enonce"}
				label="Enoncé"
				value={question.enonce_question}
				onChange={handleEnonceChange}
			/>
			<Select
				id={"type"}
				name={"type"}
				selectionValue={selectionQuestionType}
				label="Type"
				handleChange={handleTypeChange}
			/>
			<Select
				id={"bareme"}
				name={"bareme"}
				selectionValue={selectionBareme}
				label="Barème"
				handleChange={handleBaremeChange}
			/>
		</Box>
	)
}

export const OptionForm = () => {
	
	const [ resp, setResp ] = useState("")
	const [ explication, setExplication ] = useState("")
	const { question, setQuestion } = useCreateQuestion();

	const addNewResponse = (e: React.MouseEvent) => {
		e.preventDefault()

		const newOption: respType = {
			reponse: resp,
			est_correct: true,
			explication: explication
		};

		setQuestion((prev) => ({
		...prev,
		options: [...prev.options, newOption],
		}));
	}

	return (
		<Box direction="column" customStyling="w-full justify-between px-5" >
			<CustomText textTag="h4">Réponses</CustomText>
			<Box customStyling="gap-2">
				<Box direction="column" customStyling="flex flex-col w-full">
					<TextArea 
						id="reponseInput"
						name="reponseInput"
						placeholder="Ecrivez une réponse"
						value={resp}
						readonly={false}
						onChange={(e) => setResp(e.target.value)}
					/>
					<TextArea 
						id="reponseInput"
						name="reponseInput"
						placeholder="Ecrivez une explication"
						value={explication}
						readonly={false}
						onChange={(e) => setExplication(e.target.value)}
					/>
				</Box>
				<ActionButton
					action={(e) => addNewResponse(e)}
					btnColor="secondary"
					textColor="white"
				>{"+ Réponse"}</ActionButton>
			</Box>
			<ResponseMakingList responses={question.options} />
		</Box>
	)
}

const CreationQuestion = () => {

	const { handleCreate } = useCreateQuestion()

	return (
		<BodyLayout title={"Création de question"} linkBack="/formateur/gestion_question">
			<form
				id="createQuestion"
				onSubmit={handleCreate}
				className="flex flex-col gap-3 w-3/4 mx-auto"
			>
				<EnonceForm />
				<OptionForm />
				<ActionButton
					type="submit"
					btnColor="secondary"
					textColor="white"
					form="createQuestion"
				>{"Créer question"}</ActionButton>
			</form>
		</BodyLayout>
	)
}

export default CreationQuestion;