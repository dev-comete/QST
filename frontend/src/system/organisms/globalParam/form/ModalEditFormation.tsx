import type { Dispatch, SetStateAction } from "react";
import { useEditFormation } from "../../../../other/hooks/formation/useFormation";
import type { FormationPayload } from "../../../../other/types/formationType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { formChangeHandler } from "../../../../other/helper/helper";

interface FormationEditFormProps {
	formation: FormationPayload
	setFormation: Dispatch<SetStateAction<FormationPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
}

const FormationEditForm = ({ handleSubmit, formation, setFormation } : FormationEditFormProps ) => {

	return (
		<form
			id="formEditForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="nom_formation"
				name="nom_formation"
				label="Nom de la formation"
				onChange={formChangeHandler(setFormation, 'nom_formation')}
				required={true}
				value={formation.nom_formation}
			/>
		</form>
	)
}

interface ModalEditFormationProps {
	open: boolean;
	closeModal: () => void,
	id: string
}

const ModalEditFormation = ({ open, closeModal, id } : ModalEditFormationProps) => {
	const {
		isPending,
		handleEditFormation,
		formation,
		setFormation,
	} = useEditFormation(id)

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleEditFormation()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Modification de la formation"
			isOpen={open}
			closeModal={handleOnCloseModal}
			footer={
				<Box>
					<ActionButton
						btnColor="text"
						onClick={handleOnCloseModal}
					>
						Annuler
					</ActionButton>
					<ActionButton
						type="submit"
						form="formEditForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
						disabled={formation.nom_formation.length == 0}
					>
						Modifier
					</ActionButton>
				</Box>
			}
		>
			<FormationEditForm
				formation={formation}
				setFormation={setFormation}
				handleSubmit={handleSubmit}
			/>
		</Modal>
	)
}

export default ModalEditFormation;