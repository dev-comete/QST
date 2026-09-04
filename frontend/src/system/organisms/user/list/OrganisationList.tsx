import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import type { organisationType } from "../../../../other/types/userType"
import { formatDate } from "../../../../other/helper/helper"
import ModalOrgUpdate from "../form/ModalUpdateOrganisation"
import { useState } from "react"
import { useOrgDel } from "../../../../other/hooks/user/useOrganisation"

const ActionCell = ({ rowId, onEdit } : { 
	rowId: string | number | boolean | string[]
	onEdit: (id: string | number | boolean | string[]) => void 
}) => {

	const { handleDelOrg, isPending } = useOrgDel(Number(rowId))

    return (
        <Box>
			<IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => onEdit(rowId)}
            />
            <IconConfirmActionButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={handleDelOrg}
				confirmText="Voulez-vous vraiment supprimer l'organisation?"
				isLoading={isPending}
            />
        </Box>
    );
};

const getOrgTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void
): Column<organisationType>[] => [
	{
		header: 'Nom',
		key: "nom"
	},
	{
		header: 'Date de création',
		key: "date_creation",
		render: (val) => formatDate(val)
	},
	{
		header: 'Statut',
		key: "is_active",
		render: (val) => val === true ? 'Actif' : 'Inactif'
	},
	{
		header: "Action",
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} onEdit={onEdit}/>
		}
		
	}
]

const OrganisationList = ({ organisations } : { organisations : organisationType[]}) => {

	const [selectedId, setSelectedId] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedId(id as string)
		setIsModalOpen(true)
	}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={getOrgTabColumn(handleOpenEditModal)}
				data={organisations}
				rowKey={'id'}
			/>
			<ModalOrgUpdate 
				id={selectedId}
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
			/>
		</Box>
	)
}

export default OrganisationList;