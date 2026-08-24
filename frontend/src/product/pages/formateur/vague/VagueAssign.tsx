import VagueAssignForm from "../../../../system/organisms/vague/form/VagueAssignForm";
import BodyLayout from "../../../layout/common/BodyLayout";

const VagueAssign = () => {
	return (
		<BodyLayout
			title="Assignation de questions"
			linkBack="/formateur/gestion_quiz"
		>
			<VagueAssignForm />
		</BodyLayout>
	)
}

export default VagueAssign;