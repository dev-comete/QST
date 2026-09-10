import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import ModalUserCreate from "../../../system/organisms/user/form/ModalUserCreate";
import UserList from "../../../system/organisms/user/list/UserList";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../system/molecules/Navigation/NavigationBar";
import ProjectList from "../../../system/organisms/user/list/ProjectList";
import Box from "../../../system/atoms/Container/Box";
import Input from "../../../system/atoms/Form/Input";
import Select from "../../../system/atoms/Form/Select";
import { formChangeHandler } from "../../../other/helper/helper";
import { useCreateProject, useProject } from "../../../other/hooks/user/useProject";

const UserManagement = () => {
	const [ open, setOpen ] = useState(false)
	const { project, setProject, handleCreateProject } = useCreateProject()
	const { projectQuery } = useProject()
	const { data: projects, status : projectStatus } = projectQuery
	const selectionValue = [
		{ id: '0', value: 'Actif'},
		{ id: '1', value: 'Inactif'}
	]

	if (projectStatus == 'pending')
		return <Loading />
	if (!projects)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Gestion des utilisateurs"}
				titleButton={
					<ActionButton
						onClick={() => setOpen(true)}
					>{"+ Créer un utilisateur"}</ActionButton>
				}
			>
				<NavigationBar
					titles={['Utilisateurs', 'Projets']}				
				>
					<UserList projects={projects}/>
					<Box direction="column">
						<Box className='w-full'>
							<Box className='w-1/3'>
								<Input
									id={'name'}
									name={'name'}
									onChange={(e) => setProject({...project, nom: e.target.value})}
									value={project.nom}
								/>
								<Select
									id={"is_active"}
									name={"is_active"}
									selectionValue={selectionValue}
									handleChange={formChangeHandler(setProject, 'is_active', (value) => {
										return value == 'Actif'
									})}
								/>
							</Box>
							<ActionButton
								onClick={handleCreateProject}
								disabled={project.nom.trim().length === 0}
							>+ Ajouter projet</ActionButton>
						</Box>
						<ProjectList organisations={projects}/>
					</Box>
				</NavigationBar>
			</BodyLayout>
			<ModalUserCreate
				open={open}
				closeModal={() => setOpen(false)}
				listProject={projects}
			/>
		</>
    )
}

export default UserManagement;