import { useState } from "react";
import ModalRespCreate from "../../../../system/organisms/question/form/ModalRespCreate";
import QuestionForm from "../../../../system/organisms/question/form/QuestionForm";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuestionCreate = () => {

	const [ openResp, setResp ] = useState(false)

	return (
		<BodyLayout
			title={"Création de question"}
			linkBack="/formateur/gestion_question"
		>
			<QuestionForm openRespForm={() => setResp(true)}/>
			<ModalRespCreate open={openResp} setOpen={() => setResp(false)}/>
		</BodyLayout>
	)
}

export default QuestionCreate;