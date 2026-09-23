import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import ModalUserCreate from "../../../system/organisms/user/form/ModalUserCreate";
import UserList from "../../../system/organisms/user/list/UserList";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";
import NavigationBar from "../../../system/molecules/Navigation/NavigationBar";
import ProjectList from "../../../system/organisms/user/list/ProjectList";
import { useProject } from "../../../other/hooks/user/useProject";
import ModalProjectCreate from "../../../system/organisms/user/form/ModalProjectCreate";

const UserManagement = () => {
	const [ open, setOpen ] = useState(false)
	const [ openProject, setOpenProject ] = useState(false)
	const { projectQuery } = useProject()
	const { data: projects, status : projectStatus } = projectQuery

	if (projectStatus == 'pending')
		return <Loading />
	if (!projects)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Gestion des utilisateurs"}
				titleButton={
					<>
						<ActionButton
							onClick={() => setOpen(true)}
						>{"+ Créer un utilisateur"}</ActionButton>
						<ActionButton
							onClick={() => setOpenProject(true)}
						>{"+ Créer un projet"}</ActionButton>
					</>
				}
			>
				<NavigationBar
					titles={['Utilisateurs', 'Projets']}				
				>
					<UserList projects={projects}/>
					<ProjectList projects={projects}/>
				</NavigationBar>
			</BodyLayout>
			<ModalUserCreate
				open={open}
				closeModal={() => setOpen(false)}
				listProject={projects}
			/>
			<ModalProjectCreate
				open={openProject}
				closeModal={() => setOpenProject(false)}
			/>
		</>
    )
}

export default UserManagement;