import type { Dispatch, SetStateAction } from "react";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useUserUpdate } from "../../../../other/hooks/user/useUser";
import type { organisationType, userPayload, utilisateurType } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import ErrorBloc from "../../../molecules/Container/ErrorBloc";

interface UserEditFormProps {
	listTypeUser: utilisateurType[]
	listOrganisation: organisationType[]
	user: userPayload
	setUser: Dispatch<SetStateAction<userPayload>>
	handleSubmit: (e: React.SubmitEvent) => void
	errors: { userError: string | null, emailError: string | null }
}

const UserEditForm = ({ handleSubmit, user, setUser, listTypeUser, listOrganisation, errors } : UserEditFormProps ) => {

	const selectedRole = getSelectData(listTypeUser, 'type_utilisateur')
	const selectedOrganisation = getSelectData(listOrganisation, 'nom')

	return (
		<Box direction="column" className="items-center w-full">
			<form
				id="userForm"
				className="flex flex-col space-y-3"
				onSubmit={handleSubmit}
			>
				<Input 
					id="username"
					name="username"
					label="Nom d'utilisateur"
					onChange={formChangeHandler(setUser, 'username')}
					required={true}
					value={user.username}
				/>
				{errors.userError && <ErrorBloc message={errors.userError} />}
				<Input 
					id="email"
					name="email"
					label="Addresse email"
					type="email"
					onChange={formChangeHandler(setUser, 'email')}
					required={true}
					value={user.email}
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
					value={(() => {
						const val = listTypeUser.find((q) => q.id === user.type_utilisateur) ?? listTypeUser[0];
						return val.type_utilisateur;
					})()}
				/>
				<Select 
					id="organisation"
					name="organisation"
					label="Organisation"
					selectionValue={selectedOrganisation}
					handleChange={formChangeHandler(setUser, 'organisation', (value) => {
						const selected = listOrganisation.find((q) => q.nom === value) ?? listOrganisation[0]
						return [String(selected.id ?? null)]
					})}
				/>
			</form>
		</Box>
	)
}

interface ModalUserUpdateProps {
	open: boolean;
	closeModal: () => void,
	listOrganisation: organisationType[],
	id: string
}

const ModalUserUpdate = ({ id, open, closeModal, listOrganisation } : ModalUserUpdateProps) => {
	const {
		typeUserQuery,
		isPending,
		handleUpdateUser,
		user,
		setUser,
		userError,
		emailError,
		resetError,
	} = useUserUpdate(id)

	const { data: typeUsers, status : typeStatus } = typeUserQuery

	if (typeStatus == 'pending')
		return <Loading />
	if (!typeUsers)
		return <FetchError />

	const handleOnCloseModal = () => {
		resetError()
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleUpdateUser()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Modification de l'utilisateur"
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
						form="userForm"
						btnColor="primary"
						textColor="white"
						isLoading={isPending}
					>
						Modifier
					</ActionButton>
				</Box>
			}
		>
			<UserEditForm
				user={user}
				setUser={setUser}
				listTypeUser={typeUsers}
				listOrganisation={listOrganisation}
				handleSubmit={handleSubmit}
				errors={{ userError, emailError }}
			/>
		</Modal>
	)
}

export default ModalUserUpdate;