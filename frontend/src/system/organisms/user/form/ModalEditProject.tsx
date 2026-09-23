import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler } from "../../../../other/helper/helper";
import type { ProjectPayload } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { useEditProject } from "../../../../other/hooks/user/useProject";

interface ProjectEditFormProps {
	project: ProjectPayload
	setProject: Dispatch<SetStateAction<ProjectPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
}

const ProjectEditForm = ({ handleSubmit, project, setProject } : ProjectEditFormProps ) => {

	const selectionValue = [
		{ id: '0', value: 'Actif'},
		{ id: '1', value: 'Inactif'}
	]

	return (
		<form
			id="ProjectEditForm"
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
				selectionValue={selectionValue}
				handleChange={formChangeHandler(setProject, 'is_active', (value) => {
					return value == 'Actif'
				})}
				value={project.is_active == true ? selectionValue[0].value : selectionValue[1].value}
			/>
		</form>
	)
}

interface ModalProjectEditProps {
	open: boolean;
	closeModal: () => void,
	id: string
}

const ModalProjectEdit = ({ id, open, closeModal } : ModalProjectEditProps) => {
	const {
		project,
		setProject,
		isPending,
		handleEditProject,
	} = useEditProject(id)

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleEditProject()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Modification du projet"
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
						form="ProjectEditForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
						disabled={project.nom.length == 0}
					>
						Modifier
					</ActionButton>
				</Box>
			}
		>
			<ProjectEditForm
				project={project}
				setProject={setProject}
				handleSubmit={handleSubmit}
			/>
		</Modal>
	)
}

export default ModalProjectEdit;