import Box from "../../../atoms/Container/Box";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import Input from "../../../atoms/Form/Input";
import useCreateQuiz from "../../../../other/hooks/quiz/useCreateQuiz";
import Select from "../../../atoms/Form/Select";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";

interface ModalQuizCreateProps {
	open: boolean;
	closeModal: () => void
}

const QuizForm = () => {
	
	const { handleQuizSubmit, setQuiz } = useCreateQuiz()
	const { formations, formationsStatus } = useFormation()

	const statusValue = [
		{ id: 'draft', value: 'Brouillon' },
		{ id: 'published', value: 'Publié' },
	]

	if (formationsStatus == 'pending')
		return <Loading />
	
	if (!formations)
		return <FetchError />

	const selectedFormations = getSelectData(formations, 'nom_formation')

	return (
		<Box direction="column" className="w-full items-center px-5 gap-10" >
			<form
				id="quizForm"
				onSubmit={handleQuizSubmit}
				className="flex flex-col gap-5 w-full items-center px-10"
			>
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
				<Input
					id={"duree"}
					name={"duree"}
					label="Durée"
					type="time"
					step={1}
					onChange={formChangeHandler(setQuiz, 'duree')}
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
			<QuizForm />
		</Modal>
	)
}

export default ModalQuizCreate;