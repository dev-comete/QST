import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import type { questionType, responseType } from "../../../other/types/questionType";
import Box from "../../atoms/Container/Box";
import Select from "../../atoms/Form/Select";
import TextArea from "../../atoms/Form/TextArea";
import ActionButton from "../Buttons/ActionButton";
import { ResponseMakingList } from "../List/ResponseMaking";
import { Modal } from "./Modal";
import { initialQuestion } from "../../../other/types/constant";

interface ModalCreateQuestionProps {
	isOpen: boolean,
	closeModal: () => void
}

interface QuestionMakingProps {
	question: questionType,
	setQuestion: Dispatch<SetStateAction<questionType>>;
}

const EnonceForm = ({ question, setQuestion } : QuestionMakingProps) => {

	const types = [
		{id: "qcm", value: "QCM"},
		{id: "qcu", value: "QCU"},
	]

	const baremes = [
		{id: "bar1", value: "1"},
		{id: "bar2", value: "2"},
	]

	const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setQuestion((prev) => ({ ...prev, type_id: Number(value) }));
	};

	const handleBaremeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setQuestion((prev) => ({ ...prev, bareme_id: Number(value) }));
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
				values={types}
				label="Type"
				handleChange={() => handleTypeChange}
			/>
			<Select
				id={"bareme"}
				name={"bareme"}
				values={baremes}
				label="Barème"
				handleChange={() => handleBaremeChange}
			/>
		</Box>
	)
}

const OptionForm = ({ question, setQuestion } : QuestionMakingProps) => {
	
	const [ input, setInput ] = useState("")

	const addNewResponse = () => {

		const newOption: responseType = {
			reponse: input,
			est_correcte: false,
		};
		setQuestion((prev) => ({
		...prev,
		options: [...prev.options, newOption],
		}));
	}
	
	return (
		<Box direction="column" customStyling="w-full justify-between px-5" >
			<Box customStyling="justify-center items-center">
				<Box customStyling="w-3/4">
					<TextArea 
						id="reponseInput"
						name="reponseInput"
						placeholder="Ecrivez une réponse"
						value={input}
						readonly={false}
						onChange={(e) => setInput(e.target.value)}
					/>
				</Box>
				<ActionButton
					action={addNewResponse}
					btnColor="secondary"
					textColor="white"
				>{"+ Réponse"}</ActionButton>
			</Box>
			<Box customStyling="h-[50%] overflow-y-auto">
				<ResponseMakingList responses={question.options} />
			</Box>
			<ActionButton
				action={() => { alert("Question créée !"); console.log("Question = ", question) }}
				btnColor="secondary"
				textColor="white"
			>{"Créer question"}</ActionButton>
		</Box>
	)
}

const ModalCreateQuestion = ({ isOpen, closeModal } : ModalCreateQuestionProps) => {

	const subtitle = ["Enoncé", "Option"]

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)

	return (
		<Modal
			title={"Création de question"}
			subtitle={subtitle}
			isOpen={isOpen}
			closeModal={closeModal}
		>
			<EnonceForm question={question} setQuestion={setQuestion}/>
			<OptionForm question={question} setQuestion={setQuestion}/>
		</Modal>
	)
}

export default ModalCreateQuestion;