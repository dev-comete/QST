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
import { useTabNavigation } from "../../../other/hooks/navigation/useTabNavigation";
import ModalQuestionTypeCreate from "../../../system/organisms/question/form/ModalQuestionTypeCreate";
import QuestionTypeList from "../../../system/organisms/question/list/QuestionTypeList";
import { useQuestionType } from "../../../other/hooks/question/useQuestionType";

type ValidModalKey = 'user' | 'project' | 'formation' | 'typeUser' | 'typeQuestion';
type ModalKey = ValidModalKey | null;

const tabActions: Record<number, { label: string; modalKey: ModalKey }> = {	
	0: { label: "+ Créer un utilisateur", modalKey: "user" },
	1: { label: "+ Créer un type d'utilisateur", modalKey: "typeUser" },
	2: { label: "+ Créer un projet", modalKey: "project" },
	3: { label: "+ Créer une formation", modalKey: "formation" },
	4: { label: "+ Créer un type de question", modalKey: "typeQuestion" },
};

const Parameters = () => {
	const { activeTab, handleTabChange } = useTabNavigation();

	const { projectQuery } = useProject()
	const { data: projects, status : projectStatus } = projectQuery
	const { formations, formationsStatus } = useFormation()
	const { userTypes, userTypePending } = useTypeUser()
	const { questionTypeQuery } = useQuestionType()
	const { data: questionTypes, isPending: questionTypePending } = questionTypeQuery

	const [modals, setModals] = useState<Record<ValidModalKey, boolean>>({
		user: false,
		project: false,
		formation: false,
		typeUser: false,
		typeQuestion: false,
	});

	const openModal = (key: ModalKey) => {
        if (!key) return;
        setModals((prev) => ({ ...prev, [key]: true }));
    };

	const closeModal = (key: keyof typeof modals) => 
		setModals((prev) => ({ ...prev, [key]: false }));

	const currentAction = tabActions[activeTab];

	if (projectStatus == 'pending' || formationsStatus == 'pending' || userTypePending || questionTypePending)
		return <Loading />
	if (!projects || !formations || !userTypes || !questionTypes)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Paramètres généraux"}
				titleButton={
					tabActions[activeTab] && (
						<ActionButton onClick={() => openModal(currentAction.modalKey)}>
							{tabActions[activeTab].label}
						</ActionButton>
					)
				}
			>
				<NavigationBar
					titles={['Utilisateurs', 'Types d\'utilisateur', 'Projets', 'Formations', 'Types de question']}
					activeTab={activeTab}
                    onTabChange={handleTabChange}				
				>
					<UserList projects={projects}/>
					<UserTypeList userType={userTypes} />
					<ProjectList projects={projects}/>
					<FormationList formations={formations} />
					<QuestionTypeList questionTypes={questionTypes} />
				</NavigationBar>
			</BodyLayout>
			<ModalUserCreate
				open={modals.user}
				closeModal={() => closeModal("user")}
				listProject={projects}
			/>
			<ModalProjectCreate
				open={modals.project}
				closeModal={() => closeModal("project")}
			/>
			<ModalFormationCreate
				open={modals.formation}
				closeModal={() => closeModal("formation")}
			/>
			<ModalTypeUserCreate
				open={modals.typeUser}
				closeModal={() => closeModal("typeUser")}
			/>
			<ModalQuestionTypeCreate
				open={modals.typeQuestion}
				closeModal={() => closeModal("typeQuestion")}
			/>
		</>
    )
}

export default Parameters;