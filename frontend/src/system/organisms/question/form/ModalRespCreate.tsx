import { useState } from "react";
import { useCreateQuestion } from "../../../../other/hooks/question/useQuestionCreate";
import type { respType } from "../../../../other/types/questionType";
import Box from "../../../atoms/Container/Box";
import TextArea from "../../../atoms/Form/TextArea";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";


interface ModalRespCreateProps {
	open: boolean;
	setOpen: () => void
}

const RespForm = () => {
	
	const [ resp, setResp ] = useState("")
	const [ explication, setExplication ] = useState("")
	const { setQuestion } = useCreateQuestion();

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
		<Box direction="column" className="w-full items-center px-5 gap-10" >
			<TextArea 
				id="reponseInput"
				name="reponseInput"
				label="Réponse"
				placeholder="Ecrivez une réponse"
				value={resp}
				readonly={false}
				onChange={(e) => setResp(e.target.value)}
			/>
			<TextArea 
				id="reponseInput"
				name="reponseInput"
				label="Explication"
				placeholder="Ecrivez une explication"
				value={explication}
				readonly={false}
				onChange={(e) => setExplication(e.target.value)}
			/>
			<ActionButton
				action={(e) => addNewResponse(e)}
				btnColor="secondary"
				textColor="white"
			>{"Créer"}</ActionButton>
		</Box>
	)
}

const ModalRespCreate = ({ open, setOpen } : ModalRespCreateProps) => {
	return (
		<Modal
			title="Création de réponse"
			isOpen={open}
			closeModal={setOpen}
		>
			<RespForm />
		</Modal>
	)
}

export default ModalRespCreate;