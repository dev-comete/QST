import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { useVague } from "../../../../other/hooks/vague/useVague";
import type { ModalsProps } from "../../../../other/types/common";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";

const ModalVagueCreate = ({ open, closeModal } : ModalsProps) => {
	
	const { setVague, handleCreateVague } = useVague()
	const { formations, formationsStatus } = useFormation()

	if (formationsStatus == 'pending')
		return <Loading />
	if (!formations)
		return <FetchError />
	
	const selectedFormation = getSelectData(formations, 'nom_formation')

	return (
		<Modal
			title="Création de vague"
			isOpen={open}
			closeModal={closeModal}
		>
			<form
				className="flex flex-col w-full p-5 justify-between items-center"
				onSubmit={handleCreateVague}
			>
				<Select 
					id="formation"
					name="formation"
					label="Formation"
					selectionValue={selectedFormation}
					handleChange={formChangeHandler(setVague, 'formation_id', (value) => {
						const selected = selectedFormation.find((q) => q.value === value) ?? selectedFormation[0]
						return selected.id
					})}
				/>
				<Input
					id={"debut"}
					name={"debut"}
					label="Date de début"
					type="datetime-local"
					step={60}
					onChange={formChangeHandler(setVague, 'debut')}
				/>
				<Input
					id={"debut"}
					name={"debut"}
					label="Date de début"
					type="datetime-local"
					step={60}
					onChange={formChangeHandler(setVague, 'fin')}
				/>
				<ActionButton
					type="submit"
					btnColor="secondary"
					textColor="white"
					btnStyling="w-full"
				>{"Créer"}</ActionButton>
			</form>
		</Modal>
	)
}

export default ModalVagueCreate;