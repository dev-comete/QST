import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useUser } from "../../../../other/hooks/user/useUser";
import type { organisationType, utilisateurType } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";

interface ModalUserCreateProps {
	open: boolean;
	closeModal: () => void,
	listOrganisation: organisationType[]
}

interface UserFormProps {
	closeModal: () => void,
	listTypeUser: utilisateurType[]
	listOrganisation: organisationType[]
}

const UserForm = ({ closeModal, listTypeUser, listOrganisation } : UserFormProps ) => {

	const { setUser, handleCreateUser } = useUser()

	const selectedRole = getSelectData(listTypeUser, 'type_utilisateur')
	const selectedOrganisation = getSelectData(listOrganisation, 'nom')

	return (
		<Box direction="column" className="items-center w-full">
			<form
				id="userForm"
				onSubmit={(e) => {e.preventDefault() ; handleCreateUser() ; closeModal()}}
				className="flex flex-col space-y-3"
			>
				<Input 
					id="username"
					name="username"
					label="Nom d'utilisateur"
					onChange={formChangeHandler(setUser, 'username')}
				/>
				<Input 
					id="email"
					name="email"
					label="Addresse email"
					type="email"
					onChange={formChangeHandler(setUser, 'email')}
				/>
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

const ModalUserCreate = ({ open, closeModal, listOrganisation } : ModalUserCreateProps) => {

	const { typeUserQuery } = useUser()
	const { data: typeUsers, status : typeStatus } = typeUserQuery

	if (typeStatus == 'pending')
		return <Loading />
	if (!typeUsers)
		return <FetchError />

	return (
		<Modal
			title="Création d'utilisateur"
			isOpen={open}
			closeModal={closeModal}
			footer={
				<Box>
					<ActionButton
						action={closeModal}
					>
						Annuler
					</ActionButton>
					<ActionButton
						type="submit"
						form="userForm"
						btnColor="primary"
						textColor="white"
					>
						Créer
					</ActionButton>
				</Box>
			}
		>
			<UserForm
				closeModal={closeModal}
				listTypeUser={typeUsers}
				listOrganisation={listOrganisation}
			/>
		</Modal>
	)
}

export default ModalUserCreate;