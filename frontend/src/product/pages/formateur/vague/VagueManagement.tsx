import { useState } from "react";
import BodyLayout from "../../../layout/common/BodyLayout";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import VagueList from "../../../../system/organisms/vague/list/VagueList";
import ModalVagueCreate from "../../../../system/organisms/vague/form/ModalVagueCreate";

const VagueManagement = () => {

	const [ open, setOpen ] = useState(false)

	return (
		<BodyLayout
			title={"Gestion des équipes"}
			titleButton={
				<ActionButton
					onClick={(e) => { e.preventDefault(); setOpen(true)}}
				>{"+ Créer une équipe "}</ActionButton>
			}
		>
			<VagueList />
			<ModalVagueCreate
				open={open}
				closeModal={() => setOpen(false)}
			/>
		</BodyLayout>
	)
}

export default VagueManagement;