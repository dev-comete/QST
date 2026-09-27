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
import FormationList from "../../../system/organisms/globalParam/list/FormationList";
import { useFormation } from "../../../other/hooks/formation/useFormation";
import ModalFormationCreate from "../../../system/organisms/formation/form/ModalFormationCreate";

const Parameters = () => {
	const [ openUser, setOpenUser ] = useState(false)
	const [ openProject, setOpenProject ] = useState(false)
	const [ openFormation, setOpenFormation ] = useState(false)

	const [ activeTab, setActiveTab ] = useState(0);
	const { projectQuery } = useProject()
	const { data: projects, status : projectStatus } = projectQuery
	const { formations, formationsStatus } = useFormation()
	
	if (projectStatus == 'pending' || formationsStatus == 'pending')
		return <Loading />
	if (!projects || !formations)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Paramètres généraux"}
				titleButton={
					<>
						{activeTab === 0 && (
                            <ActionButton
                                onClick={() => setOpenUser(true)}
                            >{"+ Créer un utilisateur"}</ActionButton>
                        )}
                        {activeTab === 1 && (
                            <ActionButton
                                onClick={() => setOpenProject(true)}
                            >{"+ Créer un projet"}</ActionButton>
                        )}
						{activeTab === 2 && (
                            <ActionButton
                                onClick={() => setOpenFormation(true)}
                            >{"+ Créer une formation"}</ActionButton>
                        )}
					</>
				}
			>
				<NavigationBar
					titles={['Utilisateurs', 'Projets', 'Formations']}
					activeTab={activeTab}
                    onTabChange={(index) => setActiveTab(index)}				
				>
					<UserList projects={projects}/>
					<ProjectList projects={projects}/>
					<FormationList formations={formations} />
				</NavigationBar>
			</BodyLayout>
			<ModalUserCreate
				open={openUser}
				closeModal={() => setOpenUser(false)}
				listProject={projects}
			/>
			<ModalProjectCreate
				open={openProject}
				closeModal={() => setOpenProject(false)}
			/>
			<ModalFormationCreate
				open={openFormation}
				closeModal={() => setOpenFormation(false)}
			/>
		</>
    )
}

export default Parameters;