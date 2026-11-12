import type { questionIdType } from "../../../other/types/questionType";
import type { utilisateurType } from "../../../other/types/userType";
import Box from "../../../system/atoms/Container/Box";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import ListContainer from "../../../system/molecules/Container/ListContainer";
import { QuestionTypeListItem, UserListItem } from "../../../system/organisms/globalParam/container/ParamItem";

interface TypeParameterProps {
	userTypes: utilisateurType[]
	onUserTypeCreate: () => void
	questionTypes: questionIdType[]
	onQuestionTypeCreate: () => void
}

const TypeParameter = ({ userTypes, onUserTypeCreate, questionTypes, onQuestionTypeCreate } : TypeParameterProps) => {

	return (
		<Box flexDirection="flex-col md:flex-row">
			<ListContainer
				title="Utilisateur"
				emptyText="Il n'y a pas encore de quiz publié"
				data={userTypes}
				Item={UserListItem}
				titleAction={
					<ActionButton
						onClick={onUserTypeCreate}
					>+Créer un type d'utilisateur</ActionButton>
				}
			/>
			<ListContainer
				title="Question"
				emptyText="Il n'y a pas encore de quiz publié"
				data={questionTypes}
				Item={QuestionTypeListItem}
				titleAction={
					<ActionButton
						onClick={onQuestionTypeCreate}
					>+Créer un type de question</ActionButton>
				}
			/>
		</Box>
	)
}

export default TypeParameter;