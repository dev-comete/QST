// import { useState } from "react"
import type { questionIdType } from "../../../../other/types/questionType"
import type { utilisateurType } from "../../../../other/types/userType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"
import { ListItemBox } from "../../../molecules/Container/ListContainer"
import Paper from "../../../atoms/Container/Paper"

const INFO_USER_TYPE: Record<string, string> = {
    admin: "Gère les utilisateurs et dispose d'un accès complet à l'ensemble de la plateforme.",
    formateur: "Conçoit et anime les formations, gère les questions et évalue les apprenants.",
    apprenant: "Suit les formations et passe les évaluations.",
};

const INFO_QUESTION_TYPE : Record<string,string> = {
	QCM: "Question à choix multiple",
	QCU: "Question à choix unique",
	OUV: "Réponse sera corrigé par l'IA",
}

export const UserListItem = ({ item } : { item : utilisateurType}) => {
	return (
		<ListItemBox>
			<Box className="gap-5">
				<Paper className="border border-background p-2 flex items-center">{"# " + item.id}</Paper>
				<Box direction="column">
					<CustomText className="capitalize" weight="bold">{item.type_utilisateur}</CustomText>
					<CustomText isItalic>{INFO_USER_TYPE[item.type_utilisateur]}</CustomText>
				</Box>
			</Box>
		</ListItemBox>
	)
}

export const QuestionTypeListItem = ({ item } : { item : questionIdType}) => {

	// const [ isEdit, setIsEdit ] = useState(false)

	return (
		<ListItemBox>
			<Box className="gap-5">
				<Paper className="border border-background p-2 flex items-center">{"# " + item.id}</Paper>
				<Box direction="column">
					<Box className="items-center">
						<CustomText className="capitalize" weight="bold">{item.type_question}</CustomText>
						<Paper color="background" className="border border-background p-1.5 flex items-center">
							<CustomText textTag="h6">
								{item.code}
							</CustomText>
						</Paper>
					</Box>
					<CustomText isItalic>{INFO_QUESTION_TYPE[item.code]}</CustomText>
				</Box>
			</Box>
		</ListItemBox>
	)
}