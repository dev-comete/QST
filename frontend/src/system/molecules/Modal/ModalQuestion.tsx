import Box from "../../atoms/Container/Box";
import Select from "../../atoms/Form/Select";
import TextArea from "../../atoms/Form/TextArea";
import ActionButton from "../Buttons/ActionButton";
import { Modal } from "./Modal";

interface ModalCreateQuestionProps {
	isOpen: boolean,
	closeModal: () => void
}

const EnonceForm = () => {

	const types = [
		{id: "qcm", value: "QCM"},
		{id: "qcu", value: "QCU"},
	]

	const baremes = [
		{id: "bar1", value: "1"},
		{id: "bar2", value: "2"},
	]

	return (
		<Box direction="column" customStyling="w-full px-5">
			<TextArea id={"enonce"} name={"enonce"} label="Enoncé"/>
			<Select id={"type"} name={"type"} values={types} label="Type" />
			<Select id={"bareme"} name={"bareme"} values={baremes} label="Barème" />
		</Box>
	)
}

const OptionForm = () => {
	return (
		<Box direction="column" customStyling="w-full px-5" >
			<ActionButton 
				action={() => alert("Question ajoutée")}
				btnColor="primary"
				textColor="white"
			>{"+ Réponse"}</ActionButton>
			<ActionButton 
				action={() => alert("Question ajoutée")}
				btnColor="primary"
				textColor="white"
			>{"Créer question"}</ActionButton>
		</Box>
	)
}

const ModalCreateQuestion = ({ isOpen, closeModal } : ModalCreateQuestionProps) => {

	const subtitle = ["Enoncé", "Option"]

	return (
		<Modal
			title={"Création de question"}
			subtitle={subtitle}
			isOpen={isOpen}
			closeModal={closeModal}
		>
			<EnonceForm />
			<OptionForm />
		</Modal>
	)
}

export default ModalCreateQuestion;