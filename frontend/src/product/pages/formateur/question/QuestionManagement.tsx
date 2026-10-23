import { useState } from "react";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import Box from "../../../../system/atoms/Container/Box";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import ModalQuestionImport from "../../../../system/organisms/question/form/ModalQuestionImport";
import QuestionList from "../../../../system/organisms/question/list/QuestionList";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuestionManagement = () => {

	const { navigateTo } = useAppNavigation()
	const [ isImportOpen, setIsImportOpen ] = useState(false)

    return (
        <BodyLayout
			title={"Banque de questions"}
			titleButton={
				<Box className="space-x-3">
					<ActionButton
						btnColor="white"
						textColor="text"
						onClick={() => navigateTo("gestion_question/corbeille")}
					>
						<span className="items-center">
							<FAIcon name="trash-can"/>
							{"Corbeille"}
						</span>
					</ActionButton>
					<ActionButton
						btnColor="white"
						textColor="text"
						interiorIcon="file-import"
						onClick={() => setIsImportOpen(true)}
					>{"Importer (IA)"}</ActionButton>
					<ActionButton
						onClick={() => navigateTo("creation_question")}
					>{"+ Créer une question"}</ActionButton>
				</Box>
			}
		>
			<>
				<QuestionList />
				<ModalQuestionImport
					open={isImportOpen}
					closeModal={() => setIsImportOpen(false)}
				/>
			</>
		</BodyLayout>
    )
}

export default QuestionManagement;