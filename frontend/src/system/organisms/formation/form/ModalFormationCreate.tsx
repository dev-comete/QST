import type { Dispatch, SetStateAction } from "react";
import { useCreateFormation } from "../../../../other/hooks/formation/useFormation";
import type { FormationPayload } from "../../../../other/types/formationType";
import Input from "../../../atoms/Form/Input";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { formChangeHandler } from "../../../../other/helper/helper";

export interface FormationFormProps {
	formation?: FormationPayload
	setFormation: Dispatch<SetStateAction<FormationPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
	mode?: 'edit' | 'create'
}

const FormationForm = ({ handleSubmit, setFormation } : FormationFormProps ) => {

	return (
		<form
			id="formCreateForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="nom_formation"
				name="nom_formation"
				label="Nom de la formation"
				onChange={formChangeHandler(setFormation, 'nom_formation')}
				required={true}
			/>
		</form>
	)
}

interface ModalFormationCreateProps {
	open: boolean;
	closeModal: () => void,
}

const ModalFormationCreate = ({ open, closeModal } : ModalFormationCreateProps) => {
	const {
		formation,
		setFormation,
		handleCreateFormation,
		isPending,
	} = useCreateFormation()

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateFormation()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Création de la formation"
			isOpen={open}
			closeModal={handleOnCloseModal}
			footer={
				<ActionButton
					type="submit"
					form="formCreateForm"
					btnColor="primary"
					textColor="white"
					isLoading={isPending}
					disabled={formation.nom_formation.length == 0}
				>
					Créer
				</ActionButton>
			}
		>
			<FormationForm
				formation={formation}
				setFormation={setFormation}
				handleSubmit={handleSubmit}
				mode="create"
			/>
		</Modal>
	)
}

export default ModalFormationCreate;