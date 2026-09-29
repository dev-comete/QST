import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { vagueType } from "../../../../other/types/vagueType";
import { useVague } from "../../../../other/hooks/vague/useVague";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { formatDate } from "../../../../other/helper/helper";
import CustomText from "../../../atoms/Text/CustomText";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";
import { useState, type ChangeEvent } from "react";
import ModalVagueEdit from "../form/ModalVagueEdit";
import Select from "../../../atoms/Form/Select";
import { useFormation } from "../../../../other/hooks/formation/useFormation";
import Input from "../../../atoms/Form/Input";

const ActionCell = ({ rowId, onEdit }: { 
    rowId: string | number | boolean | string[]
	onEdit: (id: string | number | boolean | string[]) => void
}) => {   

	// const { handleDelVague } = useVagueDel(rowId as number)

    return (
        <Box>
			<IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => onEdit(rowId)}
            />
        </Box>
    );
};

const getVagueTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void,
) : Column<vagueType>[] => [
	{
		header: 'Nom',
		key: "nom_vague"
	},
	{
		header: 'Formation',
		key: "formation_nom"
	},
	{
		header: 'Début',
		key: "debut",
		render: (value) => formatDate(value)
	},
	{
		header: 'Fin',
		key: "fin",
		render: (value) => formatDate(value)
	},
	{
		header: "Inscription",
		key: 'etudiants',
		render: (value) => {
			const count = Array.isArray(value) ? value.length : 0;
			return <CustomText textTag="h4">{`${count} apprenant${count > 0 ? 's' : ''}`}</CustomText>
		}
		
	},
	{
		header: null,
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={String(value)} onEdit={onEdit} />
		}
		
	}
]

const VagueList = () => {

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedVagueId, setSelectedVagueId] = useState<string>('')
	const { navigateTo } = useAppNavigation()
	const { formations, formationsStatus } = useFormation()
	const [ formationFilter, setFormationFilter ] = useState<string>('')
	const [ periodFilter, setPeriodFilter ] = useState<{ year: string, month: string}>({
		year: '',
		month: ''
	})
	const { getAllVague } = useVague({ 
		formation: formationFilter,
		month: periodFilter.month,
		year: periodFilter.year
	})
	const { data: vagues, status } = getAllVague

	const isLoading = status == 'pending' || formationsStatus == 'pending'
	
	if (!isLoading && (!vagues || !formations))
		return <FetchError />

	const selectionFormation = [
		{ id: '', value: 'Toutes les formations' },
		...(formations?.map((f) => ({
			id: String(f.id),
			value: f.nom_formation
		})) ?? [])
	]

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedVagueId(id as string)
        setIsModalOpen(true)
    }

	const handleFormationChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const selectedText = e.target.value
		const selectedItem = selectionFormation.find((item) => item.value === selectedText)
		setFormationFilter(selectedItem ? selectedItem.id : '')
	}

	const handlePeriodChange = (e: ChangeEvent<HTMLInputElement>) => {
		const period = e.target.value.split('-')

		if (period.length == 2)
			setPeriodFilter({
				month: period[1],
				year: period[0]
			})
	}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			{isLoading && <Loading />}
			{!isLoading && 			
				<Table 
					columns={getVagueTabColumn(handleOpenEditModal)}
					data={vagues ?? []}
					rowKey={'id'}
					onRowClick={(row) => navigateTo('vagues/' + row.id)}
					filters={
						<Box className="flex items-center self-start">
							<Select 
								id="type-question"
								name="type-question"
								selectionValue={selectionFormation}
								handleChange={handleFormationChange}
								value={
									formationFilter === '' 
										? 'Toutes les formations' 
										: formations?.find((f) => String(f.id) === formationFilter)?.nom_formation ?? ''
								}
							/>
							<Input
								id={"debut"}
								name={"debut"}
								type="month"
								onChange={handlePeriodChange}
								required
							/>
						</Box>
					}
				/>
			}
			<ModalVagueEdit
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={selectedVagueId}
			/>
		</Box>
	)
}

export default VagueList;