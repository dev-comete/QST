import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler } from "../../../../other/helper/helper";
import type { OrganisationPayload } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { useEditOrganisation } from "../../../../other/hooks/user/useOrganisation";

interface OrgEditFormProps {
	organisation: OrganisationPayload
	setOrganisation: Dispatch<SetStateAction<OrganisationPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
}

const OrgEditForm = ({ handleSubmit, organisation, setOrganisation } : OrgEditFormProps ) => {

	const selectionValue = [
		{ id: '0', value: 'Actif'},
		{ id: '1', value: 'Inactif'}
	]

	return (
		<Box direction="column" className="items-center w-full">
			<form
				id="orgEditForm"
				className="flex flex-col space-y-3"
				onSubmit={handleSubmit}
			>
				<Input 
					id="name"
					name="name"
					label="Nom de l'organisation"
					onChange={formChangeHandler(setOrganisation, 'nom')}
					required={true}
					value={organisation.nom}
				/>
				<Select
					id={"is_active"}
					name={"is_active"}
					selectionValue={selectionValue}
					handleChange={formChangeHandler(setOrganisation, 'is_active', (value) => {
						return value == 'Actif'
					})}
					value={organisation.is_active == true ? selectionValue[0].value : selectionValue[1].value}
				/>
			</form>
		</Box>
	)
}

interface ModalOrgUpdateProps {
	open: boolean;
	closeModal: () => void,
	id: string
}

const ModalOrgUpdate = ({ id, open, closeModal } : ModalOrgUpdateProps) => {
	const {
		organisation,
		setOrganisation,
		isPending,
		handleEditOrganisation,
	} = useEditOrganisation(id)

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleEditOrganisation()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Modification de l'organisation"
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
						form="orgEditForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
					>
						Modifier
					</ActionButton>
				</Box>
			}
		>
			<OrgEditForm
				organisation={organisation}
				setOrganisation={setOrganisation}
				handleSubmit={handleSubmit}
			/>
		</Modal>
	)
}

export default ModalOrgUpdate;