import type { Dispatch, SetStateAction } from "react";
import Input from "../../../atoms/Form/Input";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { formChangeHandler } from "../../../../other/helper/helper";
import type { UserTypePayload } from "../../../../other/types/userType";
import { useTypeUserCreate } from "../../../../other/hooks/user/useUser";

export interface TypeUserForm {
	typeUser?: UserTypePayload
	setTypeUser: Dispatch<SetStateAction<UserTypePayload>>
	handleSubmit: (e: React.SubmitEvent) => void
	mode?: 'edit' | 'create'
}

const TypeUserForm = ({ handleSubmit, setTypeUser } : TypeUserForm ) => {

	return (
		<form
			id="typeUserForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="type_user"
				name="type_user"
				label="Type d'utilisateur"
				onChange={formChangeHandler(setTypeUser, 'type_utilisateur')}
				required={true}
			/>
		</form>
	)
}

interface ModalTypeUserCreateProps {
	open: boolean;
	closeModal: () => void,
}

const ModalTypeUserCreate = ({ open, closeModal } : ModalTypeUserCreateProps) => {
	const {
		userType,
		setUserType,
		handleCreateTypeUser,
		isPending,
	} = useTypeUserCreate()

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateTypeUser()
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
					form="typeUserForm"
					btnColor="primary"
					textColor="white"
					isLoading={isPending}
					disabled={userType.type_utilisateur.length == 0}
				>
					Créer
				</ActionButton>
			}
		>
			<TypeUserForm
				typeUser={userType}
				setTypeUser={setUserType}
				handleSubmit={handleSubmit}
				mode="create"
			/>
		</Modal>
	)
}

export default ModalTypeUserCreate;