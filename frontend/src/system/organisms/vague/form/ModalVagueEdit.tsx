import { useEffect, useState } from "react";
import { dateChangeHandler, formatDateForInput, formChangeHandler, fromDateTime, toDateTime } from "../../../../other/helper/helper";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import { useVagueEdit } from "../../../../other/hooks/vague/useVague";
import Input from "../../../atoms/Form/Input";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { DatePicking } from "../../../atoms/Form/TimePicking";

interface ModalVagueEditProps {
	open: boolean,
	closeModal: () => void,
	id: string
}

const ModalVagueEdit = ({ open, closeModal, id } : ModalVagueEditProps) => {
	
	const { vague, setVague, handleVagueEdit, isPending } = useVagueEdit(id)
	const { formations, formationsStatus } = useFormation()
	const [dateDebut, setDateDebut] = useState<Date | null>(null)
	const [dateFin, setDateFin] = useState<Date | null>(null)

	useEffect(() => {
		setDateDebut(fromDateTime(vague.debut))
		setDateFin(fromDateTime(vague.fin))
	}, [vague])

	if (formationsStatus == 'pending')
		return <Loading />
	if (!formations)
		return <FetchError />

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleVagueEdit()
			closeModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Modification de l'équipe"
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
					value={vague.nom_vague ?? ''}
				/>
				<Input
					id={"formation"}
					name={"formation"}
					label="Formation"
					value={formations.find((q) => q.id == vague.formation_id)?.nom_formation}
					readOnly
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
				>{"Modifier"}</ActionButton>
			</form>
		</Modal>
	)
}

export default ModalVagueEdit;