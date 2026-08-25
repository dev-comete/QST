import VagueAssignForm from "../../../../system/organisms/vague/form/VagueAssignForm";
import BodyLayout from "../../../layout/common/BodyLayout";

const VagueAssign = () => {
	return (
		<BodyLayout
			title="Assignation de quiz et apprenants"
			linkBack="/formateur/gestion_vague"
		>
			<VagueAssignForm />
		</BodyLayout>
	)
}

export default VagueAssign;