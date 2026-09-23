import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useCreateUser } from "../../../../other/hooks/user/useUser";
import type { projectType, userPayload, utilisateurType } from "../../../../other/types/userType";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import ProjetForm from "./ProjetForm";
import Info from "../../../atoms/Form/Info";

interface UserFormProps {
	listTypeUser: utilisateurType[]
	listProject: projectType[]
	setUser: Dispatch<SetStateAction<userPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
	errors: { userError: string | null, emailError: string | null }
}

const UserForm = ({ handleSubmit, setUser, listTypeUser, listProject, errors } : UserFormProps ) => {

	const selectedRole = getSelectData(listTypeUser, 'type_utilisateur')

	return (
		<form
			id="userForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="username"
				name="username"
				label="Nom d'utilisateur"
				onChange={formChangeHandler(setUser, 'username')}
				required={true}
			/>
			{errors.userError && <Info info={errors.userError} variant='error'/>}
			<Input 
				id="email"
				name="email"
				label="Addresse email"
				type="email"
				onChange={formChangeHandler(setUser, 'email')}
				required={true}
			/>
			{errors.emailError && <Info info={errors.emailError} variant='error'/>}
			<Select 
				id="role"
				name="role"
				label="Rôle"
				selectionValue={selectedRole}
				handleChange={formChangeHandler(setUser, 'type_utilisateur', (value) => {
					const selected = listTypeUser.find((q) => q.type_utilisateur === value) ?? listTypeUser[0]
					return selected.id ?? null
				})}
			/>
			<ProjetForm listProject={listProject} setUser={setUser}/>
		</form>
	)
}

interface ModalUserCreateProps {
	open: boolean;
	closeModal: () => void,
	listProject: projectType[],
}

const ModalUserCreate = ({ open, closeModal, listProject } : ModalUserCreateProps) => {

	const {
		userTypes,
		userTypePending,
		isPending,
		handleCreateUser,
		setUser,
		userError,
		emailError,
		resetError,
	} = useCreateUser()

	if (userTypePending)
		return <Loading />
	if (!userTypes)
		return <FetchError />

	const handleOnCloseModal = () => {
		resetError()
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		await handleCreateUser()
		handleOnCloseModal()
	}

	return (
		<Modal
			title="Création d'utilisateur"
			isOpen={open}
			closeModal={handleOnCloseModal}
			footer={
				<ActionButton
					type="submit"
					form="userForm"
					btnColor="primary"
					textColor="white"
					isLoading={isPending}
				>
					Créer
				</ActionButton>
			}
		>
			<UserForm
				setUser={setUser}
				listTypeUser={userTypes}
				listProject={listProject}
				handleSubmit={handleSubmit}
				errors={{ userError, emailError }}
			/>
		</Modal>
	)
}

export default ModalUserCreate;