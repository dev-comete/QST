import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import ModalUserCreate from "../../../system/organisms/user/form/ModalUserCreate";
import UserList from "../../../system/molecules/List/UserList";
import { useUser } from "../../../other/hooks/user/useUser";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";

const UserManagement = () => {

	const [ open, setOpen ] = useState(false)
	const { typeUserQuery, organisationQuery } = useUser()
	const { data: typeUsers, status : typeStatus } = typeUserQuery
	const { data: organisations, status : organisationStatus } = organisationQuery

	if (typeStatus == 'pending' || organisationStatus == 'pending')
		return <Loading />
	if (!typeUsers || !organisations)
		return <FetchError />

    return (
        <BodyLayout
			title={"Liste des utilisateurs"}
			titleButton={
				<ActionButton
					action={() => setOpen(true)}
					btnColor="secondary"
					textColor="white"
				>{"+ Créer un utilisateur"}</ActionButton>
			}
		>
			<UserList />
			<ModalUserCreate
				open={open}
				closeModal={() => setOpen(false)}
				listTypeUser={typeUsers}
				listOrganisation={organisations}
			/>
		</BodyLayout>
    )
}

export default UserManagement;