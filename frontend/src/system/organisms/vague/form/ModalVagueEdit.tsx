import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";

interface ModalVagueEditProps {
	open: boolean,
	closeModal: () => void,
	id: string
}

const ModalVagueEdit = ({ open, closeModal, id } : ModalVagueEditProps) => {
	
	const { setVague, handleCreateVague, isPending } = useVagueEdit(id)
	const { formations, formationsStatus } = useFormation()

	if (formationsStatus == 'pending')
		return <Loading />
	if (!formations)
		return <FetchError />
	
	const selectedFormation = getSelectData(formations, 'nom_formation')

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateVague()
			closeModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Création de vague"
			isOpen={open}
			closeModal={closeModal}
		>
			<form
				className="flex flex-col w-full p-5 justify-between items-center space-y-5"
				onSubmit={handleSubmit}
			>
				<Input
					id={"nom_vague"}
					name={"nom_vague"}
					label="Nom de la vague"
					onChange={formChangeHandler(setVague, 'nom_vague')}
					required
				/>
				<Select 
					id="formation"
					name="formation"
					label="Formation"
					selectionValue={selectedFormation}
					handleChange={formChangeHandler(setVague, 'formation_id', (value) => {
						const selected = formations.find((q) => q.nom_formation === value) ?? selectedFormation[0]
						return String(selected.id)
					})}
					required
				/>
				<Input
					id={"debut"}
					name={"debut"}
					label="Date de début"
					type="datetime-local"
					step={60}
					onChange={formChangeHandler(setVague, 'debut')}
					required
				/>
				<Input
					id={"debut"}
					name={"debut"}
					label="Date de début"
					type="datetime-local"
					step={60}
					onChange={formChangeHandler(setVague, 'fin')}
					required
				/>
				<ActionButton
					type="submit"
					btnStyling="w-full"
					isLoading={isPending}
				>{"Créer"}</ActionButton>
			</form>
		</Modal>
	)
}

export default ModalVagueEdit;