import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import ModalUserCreate from "../../../system/organisms/user/form/ModalUserCreate";
import UserList from "../../../system/organisms/user/list/UserList";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../system/molecules/Navigation/NavigationBar";
import OrganisationList from "../../../system/organisms/user/list/OrganisationList";
import Box from "../../../system/atoms/Container/Box";
import Input from "../../../system/atoms/Form/Input";
import Select from "../../../system/atoms/Form/Select";
import { formChangeHandler } from "../../../other/helper/helper";
import { useCreateOrganisation, useOrganistion } from "../../../other/hooks/user/useOrganisation";

const UserManagement = () => {
	const [ open, setOpen ] = useState(false)
	const { organisation, setOrganisation, handleCreateOrganisation } = useCreateOrganisation()
	const { organisationQuery } = useOrganistion()
	const { data: organisations, status : organisationStatus } = organisationQuery
	const selectionValue = [
		{ id: '0', value: 'Actif'},
		{ id: '1', value: 'Inactif'}
	]

	if (organisationStatus == 'pending')
		return <Loading />
	if (!organisations)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Liste des utilisateurs"}
				titleButton={
					<ActionButton
						onClick={() => setOpen(true)}
					>{"+ Créer un utilisateur"}</ActionButton>
				}
			>
				<NavigationBar
					titles={['Utilisateur', 'Organisation']}				
				>
					<UserList organisations={organisations}/>
					<Box direction="column">
						<Box className='w-full'>
							<Box className='w-1/3'>
								<Input
									id={'name'}
									name={'name'}
									onChange={(e) => setOrganisation({...organisation, nom: e.target.value})}
									value={organisation.nom}
								/>
								<Select
									id={"is_active"}
									name={"is_active"}
									selectionValue={selectionValue}
									handleChange={formChangeHandler(setOrganisation, 'is_active', (value) => {
										return value == 'Actif'
									})}
								/>
							</Box>
							<ActionButton
								onClick={handleCreateOrganisation}
								disabled={organisation.nom.trim().length === 0}
							>+ Ajouter</ActionButton>
						</Box>
						<OrganisationList organisations={organisations}/>
					</Box>
				</NavigationBar>
			</BodyLayout>
			<ModalUserCreate
				open={open}
				closeModal={() => setOpen(false)}
				listOrganisation={organisations}
			/>
		</>
    )
}

export default UserManagement;