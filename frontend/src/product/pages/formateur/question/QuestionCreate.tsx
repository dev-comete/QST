import { useState } from "react";
import ModalRespCreate from "../../../../system/organisms/question/form/ModalRespCreate";
import QuestionForm from "../../../../system/organisms/question/form/QuestionForm";
import BodyLayout from "../../../layout/common/BodyLayout";
import Paper from "../../../../system/atoms/Container/Paper";

const QuestionCreate = () => {

	const [ openResp, setResp ] = useState(false)

	return (
		<BodyLayout
			title={"Création de question"}
			linkBack="/formateur/gestion_question"
		>
			<Paper className="p-3">
				<QuestionForm openRespForm={() => setResp(true)}/>
				<ModalRespCreate open={openResp} setOpen={() => setResp(false)}/>
			</Paper>
		</BodyLayout>
	)
}

export default QuestionCreate;