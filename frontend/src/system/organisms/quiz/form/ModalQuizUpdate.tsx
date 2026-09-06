import Box from "../../../atoms/Container/Box";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { useQuizEdit } from "../../../../other/hooks/quiz/useQuiz";

interface ModalQuizUpdateProps {
	open: boolean;
	closeModal: () => void
	id: number
}

const QuizForm = ({ closeModal, id } : { closeModal : () => void, id: number }) => {
	
	const { handleQuizEdit, quiz, setQuiz, isPending } = useQuizEdit(id)
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

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleQuizEdit()
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
					value={quiz.titre}
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
					value={selectedFormations.find((q) => q.value == quiz.formation)?.value}
				/>
				<Input
					id={"duree"}
					name={"duree"}
					label="Durée"
					type="time"
					step={1}
					onChange={formChangeHandler(setQuiz, 'duree')}
					required={true}
					value={quiz.duree}
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
					value={quiz.status == 'draft' ? statusValue[0].value : statusValue[1].value}

				/>
				<ActionButton
					type="submit"
					textColor="white"
					isLoading={isPending}
				>{"Modifier"}</ActionButton>
			</form>
		</Box>
	)
}

const ModalQuizUpdate = ({ open, closeModal, id } : ModalQuizUpdateProps) => {
	return (
		<Modal
			title="Modification du quiz"
			isOpen={open}
			closeModal={closeModal}
		>
			<QuizForm closeModal={closeModal} id={id}/>
		</Modal>
	)
}

export default ModalQuizUpdate;