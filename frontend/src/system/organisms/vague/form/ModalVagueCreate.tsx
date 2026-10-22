import { useState } from "react";
import { dateChangeHandler, formChangeHandler, getSelectData, toDateTime } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { useVagueCreate } from "../../../../other/hooks/vague/useVague";
import type { ModalsProps } from "../../../../other/types/common";
import Input from "../../../atoms/Form/Input";
import Select from "../../../atoms/Form/Select";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { DatePicking } from "../../../atoms/Form/TimePicking";

const ModalVagueCreate = ({ open, closeModal } : ModalsProps) => {
	
	const { setVague, handleCreateVague, isPending } = useVagueCreate()
	const { formations, formationsStatus } = useFormation()
	const [dateDebut, setDateDebut] = useState<Date | null>(null)
	const [dateFin, setDateFin] = useState<Date | null>(null)
	

	if (formationsStatus == 'pending')
		return <Loading />
	if (!formations)
		return <FetchError />
	
	const selectedFormation = getSelectData(formations, 'nom_formation')

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateVague()
			closeModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Création de l'équipe"
			isOpen={open}
			closeModal={closeModal}
		>
			<form
				className="flex flex-col w-full p-5 justify-between items-center space-y-5"
				onSubmit={handleSubmit}
			>
				<Input
					id={"nom_vague"}
					name={"nom_vague"}
					label="Nom de l'équipe"
					onChange={formChangeHandler(setVague, 'nom_vague')}
					required
				/>
				<Select 
					id="formation"
					name="formation"
					label="Formation"
					selectionValue={selectedFormation}
					handleChange={formChangeHandler(setVague, 'formation_id', (value: string): number => {
						const selected = formations.find((q) => q.nom_formation === value) ?? formations[0]
						return Number(selected?.id ?? 0)
					})}
					required
				/>
				<DatePicking
					id="date_debut"
					label="Date de début"
					date={dateDebut}
					onChange={dateChangeHandler(setVague, 'debut', toDateTime, setDateDebut)}
				/>
				<DatePicking
					id="date_fin"
					label="Date de fin"
					date={dateFin}
					onChange={dateChangeHandler(setVague, 'fin', toDateTime, setDateFin)}
				/>
				<ActionButton
					type="submit"
					btnStyling="w-full"
					isLoading={isPending}
				>{"Créer"}</ActionButton>
			</form>
		</Modal>
	)
}

export default ModalVagueCreate;