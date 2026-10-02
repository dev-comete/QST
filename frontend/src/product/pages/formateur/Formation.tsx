import { useState } from "react";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import ModalFormationCreate from "../../../system/organisms/formation/form/ModalFormationCreate";
import FormationList from "../../../system/organisms/globalParam/list/FormationList";
import BodyLayout from "../../layout/common/BodyLayout";
import { useFormation } from "../../../other/hooks/formation/useFormation";

const Formation = () => {
	const [ openFormation, setOpenFormation ] = useState(false)
	const { formations, formationsStatus } = useFormation()
	
	if (formationsStatus == 'pending')
		return <Loading />
	if (!formations)
		return <FetchError />

    return (
		<>
			<BodyLayout
				title={"Formations"}
				titleButton={
					<ActionButton
						onClick={() => setOpenFormation(true)}
					>{"+ Créer une formation"}</ActionButton>
				}
			>
				<FormationList formations={formations} />
			</BodyLayout>
			<ModalFormationCreate
				open={openFormation}
				closeModal={() => setOpenFormation(false)}
			/>
		</>
    )
}

export default Formation;