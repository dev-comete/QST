import { useState } from "react";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import BodyLayout from "../../layout/common/BodyLayout";
import ModalVagueCreate from "../../../system/organisms/vague/form/ModalVagueCreate";
import VagueList from "../../../system/organisms/vague/list/VagueList";

const VagueManagement = () => {

	const [ open, setOpen ] = useState(false)

	return (
		<BodyLayout
			title={"Liste des vagues"}
			titleButton={
				<ActionButton
					action={(e) => { e.preventDefault(); setOpen(true)}}
				>{"+ Créer une vague "}</ActionButton>
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