import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import { EnonceForm, OptionForm } from "../../../system/molecules/Modal/ModalQuestion";
import { useQuestion } from "../../../other/hooks/useQuestion";
import type { questionType } from "../../../other/types/questionType";
import { initialQuestion } from "../../../other/types/constant";
import BodyLayout from "../../layout/common/BodyLayout";

const CreationQuestion = () => {

	const [ question, setQuestion ] = useState<questionType>(initialQuestion)
	const { handleCreate } = useQuestion(question)

	return (
		<BodyLayout title={"Création de question"}>
			<form onSubmit={handleCreate} className="flex flex-col gap-3">
				<EnonceForm question={question} setQuestion={setQuestion}/>
				<OptionForm question={question} setQuestion={setQuestion}/>
				<ActionButton
					type="submit"
					btnColor="secondary"
					textColor="white"
				>{"Créer question"}</ActionButton>
			</form>
		</BodyLayout>
	)
}

export default CreationQuestion;