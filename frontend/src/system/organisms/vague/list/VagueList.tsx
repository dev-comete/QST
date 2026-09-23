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
import { useState } from "react";
import ModalVagueEdit from "../form/ModalVagueEdit";

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
		header: "Action",
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={String(value)} onEdit={onEdit} />
		}
		
	}
]

const VagueList = () => {

	const { getAllVague } = useVague()
	const { data: vagues, status } = getAllVague
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedVagueId, setSelectedVagueId] = useState<string>('')
	const { navigateTo } = useAppNavigation()

	if (status == 'pending')
		return <Loading />
	
	if (!vagues)
		return <FetchError />

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedVagueId(id as string)
        setIsModalOpen(true)
    }

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={getVagueTabColumn(handleOpenEditModal)}
				data={vagues}
				rowKey={'id'}
				onRowClick={(row) => navigateTo('vagues/' + row.id)}
			/>
			<ModalVagueEdit
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={selectedVagueId}
			/>
		</Box>
	)
}

export default VagueList;