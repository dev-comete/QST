import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import { useUserDel } from "../../../../other/hooks/user/useUser"
import type { organisationType } from "../../../../other/types/userType"
import { formatDate } from "../../../../other/helper/helper"

const ActionCell = ({ rowId } : {rowId : string | number | boolean | string[] }) => {

	const { handleDelUser } = useUserDel(rowId as string)

    return (
        <Box>
			<IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => alert("Edit mode")}
            />
            <IconConfirmActionButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={handleDelUser}
				confirmText="Voulez-vous vraiment supprimer l'organisation?"
            />
        </Box>
    );
};

const organisationTabColumn: Column<organisationType>[] = [
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
			return <ActionCell rowId={value ? value : ''} />
		}
		
	}
]

const OrganisationList = ({ organisations } : { organisations : organisationType[]}) => {

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={organisationTabColumn}
				data={organisations}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default OrganisationList;