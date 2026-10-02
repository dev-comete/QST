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
import { useTypeUser } from "../../../other/hooks/user/useUser";
import ModalTypeUserCreate from "../../../system/organisms/user/form/ModalTypeUserCreate";
import UserTypeList from "../../../system/organisms/user/list/UserTypeList";

const Parameters = () => {
	const [ openUser, setOpenUser ] = useState(false)
	const [ openProject, setOpenProject ] = useState(false)
	const [ openFormation, setOpenFormation ] = useState(false)
	const [ openType, setOpenType ] = useState(false)

	const [ activeTab, setActiveTab ] = useState(0);
	const { projectQuery } = useProject()
	const { data: projects, status : projectStatus } = projectQuery
	const { formations, formationsStatus } = useFormation()
	const { userTypes, userTypePending } = useTypeUser()

	if (projectStatus == 'pending' || formationsStatus == 'pending' || userTypePending)
		return <Loading />
	if (!projects || !formations || !userTypes)
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
                                onClick={() => setOpenType(true)}
                            >{"+ Créer un type"}</ActionButton>
                        )}
                        {activeTab === 2 && (
                            <ActionButton
                                onClick={() => setOpenProject(true)}
                            >{"+ Créer un projet"}</ActionButton>
                        )}
						{activeTab === 3 && (
                            <ActionButton
                                onClick={() => setOpenFormation(true)}
                            >{"+ Créer une formation"}</ActionButton>
                        )}
					</>
				}
			>
				<NavigationBar
					titles={['Utilisateurs', 'Types d\'utilisateur', 'Projets', 'Formations']}
					activeTab={activeTab}
                    onTabChange={(index) => setActiveTab(index)}				
				>
					<UserList projects={projects}/>
					<UserTypeList userType={userTypes} />
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
			<ModalTypeUserCreate
				open={openType}
				closeModal={() => setOpenType(false)}
			/>
		</>
    )
}

export default Parameters;