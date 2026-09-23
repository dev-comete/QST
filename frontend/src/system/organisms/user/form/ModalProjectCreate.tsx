import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler } from "../../../../other/helper/helper";
import type { ProjectPayload } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { useCreateProject } from "../../../../other/hooks/user/useProject";

interface ProjectCreateFormProps {
	project: ProjectPayload
	setProject: Dispatch<SetStateAction<ProjectPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
}

const ProjectCreateForm = ({ handleSubmit, project, setProject } : ProjectCreateFormProps ) => {

	const selectionValue = [
		{ id: '0', value: 'Actif'},
		{ id: '1', value: 'Inactif'}
	]

	return (
		<form
			id="ProjectCreateForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="name"
				name="name"
				label="Nom du projet"
				onChange={formChangeHandler(setProject, 'nom')}
				required={true}
				value={project.nom}
			/>
			<Select
				id={"is_active"}
				name={"is_active"}
				label="Statut"
				selectionValue={selectionValue}
				handleChange={formChangeHandler(setProject, 'is_active', (value) => {
					return value == 'Actif'
				})}
				value={project.is_active == true ? selectionValue[0].value : selectionValue[1].value}
			/>
		</form>
	)
}

interface ModalProjectCreateProps {
	open: boolean;
	closeModal: () => void,
}

const ModalProjectCreate = ({ open, closeModal } : ModalProjectCreateProps) => {
	const {
		project,
		setProject,
		isPending,
		handleCreateProject,
	} = useCreateProject()

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateProject()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Création de projet"
			isOpen={open}
			closeModal={handleOnCloseModal}
			footer={
				<Box>
					<ActionButton
						type="submit"
						form="ProjectCreateForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
						disabled={project.nom.length == 0}
					>
						Créer
					</ActionButton>
				</Box>
			}
		>
			<ProjectCreateForm
				project={project}
				setProject={setProject}
				handleSubmit={handleSubmit}
			/>
		</Modal>
	)
}

export default ModalProjectCreate;