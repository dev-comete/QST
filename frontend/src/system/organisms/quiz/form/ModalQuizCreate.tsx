import Box from "../../../atoms/Container/Box";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import Input from "../../../atoms/Form/Input";
import useCreateQuiz from "../../../../other/hooks/quiz/useCreateQuiz";
import Select from "../../../atoms/Form/Select";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import { dateChangeHandler, formChangeHandler, getSelectData, toDuration } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { useState } from "react";
import {DurationPicking} from "../../../atoms/Form/TimePicking";

interface ModalQuizCreateProps {
	open: boolean;
	closeModal: () => void
}

const QuizForm = ({ closeModal } : { closeModal : () => void }) => {
	
	const { handleQuizSubmit, setQuiz, isPending } = useCreateQuiz()
	const { formations, formationsStatus } = useFormation()
	const [duree, setDuree] = useState<Date | null>(null)

	const statusValue = [
		{ id: 'draft', value: 'Brouillon' },
		{ id: 'published', value: 'Publié' },
	]

	if (formationsStatus == 'pending')
		return <Loading />
	
	if (!formations)
		return <FetchError />

	const selectedFormations = getSelectData(formations, 'nom_formation')

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleQuizSubmit()
			closeModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Box direction="column" className="w-full items-center px-5 gap-10" >
			<form
				id="quizForm"
				onSubmit={handleSubmit}
				className="flex flex-col gap-5 w-full items-center px-10"
			>
				<Input
					id={"titre"}
					name={"titre"}
					label="Titre du quiz"
					onChange={formChangeHandler(setQuiz, 'titre')}
					required={true}
				/>
				<Select 
					id="formation"
					name="formation"
					label="Formation"
					selectionValue={selectedFormations}
					handleChange={formChangeHandler(setQuiz, 'formation', (value) => {
						const selected = formations.find((q) => q.nom_formation === value) ?? formations[0]
						return String(selected.id)
					})}
				/>
				<DurationPicking
					label="duree"
					id="duree"
					duree={duree}
					onChange={dateChangeHandler(setQuiz, 'duree', toDuration, setDuree)}
				/>
				<Select 
					id="status"
					name="status"
					label="Statut"
					selectionValue={statusValue}
					handleChange={formChangeHandler(setQuiz, 'status', (value) => {
						const selected = statusValue.find((q) => q.value === value) ?? statusValue[0]
						return String(selected.id)
					})}
				/>
				<ActionButton
					type="submit"
					textColor="white"
					isLoading={isPending}
				>{"Créer"}</ActionButton>
			</form>
		</Box>
	)
}

const ModalQuizCreate = ({ open, closeModal } : ModalQuizCreateProps) => {
	return (
		<Modal
			title="Création de quiz"
			isOpen={open}
			closeModal={closeModal}
		>
			<QuizForm closeModal={closeModal}/>
		</Modal>
	)
}

export default ModalQuizCreate;