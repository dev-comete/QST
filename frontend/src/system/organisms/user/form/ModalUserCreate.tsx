import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useCreateUser } from "../../../../other/hooks/user/useUser";
import type { organisationType, userPayload, utilisateurType } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import ErrorBloc from "../../../molecules/Container/ErrorBloc";
import OrganisationForm from "./OrganisationForm";

interface UserFormProps {
	listTypeUser: utilisateurType[]
	listOrganisation: organisationType[]
	setUser: Dispatch<SetStateAction<userPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
	errors: { userError: string | null, emailError: string | null }
}

const UserForm = ({ handleSubmit, setUser, listTypeUser, listOrganisation, errors } : UserFormProps ) => {

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
			{errors.userError && <ErrorBloc message={errors.userError} />}
			<Input 
				id="email"
				name="email"
				label="Addresse email"
				type="email"
				onChange={formChangeHandler(setUser, 'email')}
				required={true}
			/>
			{errors.emailError && <ErrorBloc message={errors.emailError} />}
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
			<OrganisationForm listOrganisation={listOrganisation} setUser={setUser}/>
		</form>
	)
}

interface ModalUserCreateProps {
	open: boolean;
	closeModal: () => void,
	listOrganisation: organisationType[],
}

const ModalUserCreate = ({ open, closeModal, listOrganisation } : ModalUserCreateProps) => {

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
				<Box>
					<ActionButton
						onClick={handleOnCloseModal}
					>
						Annuler
					</ActionButton>
					<ActionButton
						type="submit"
						form="userForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
					>
						Créer
					</ActionButton>
				</Box>
			}
		>
			<UserForm
				setUser={setUser}
				listTypeUser={userTypes}
				listOrganisation={listOrganisation}
				handleSubmit={handleSubmit}
				errors={{ userError, emailError }}
			/>
		</Modal>
	)
}

export default ModalUserCreate;