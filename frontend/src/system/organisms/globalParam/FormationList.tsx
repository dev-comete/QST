import { useAppNavigation } from "../../../other/hooks/navigation/useAppNavigation";
import type { Formation } from "../../../other/types/formationType";
import Box from "../../atoms/Container/Box";
import { Table, type Column } from "../../atoms/Table/Table";
import IconButton from "../../molecules/Buttons/IconButton";

const ActionCell = ({ rowId } : {rowId : unknown }) => {
    const { navigateTo } = useAppNavigation();

    return (
        <Box>
            <IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => {
                    navigateTo(`${rowId}/assign_vague`);
                }}
            />
            <IconButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={() => alert('Suppression')}
            />
        </Box>
    );
};

const formationTabColumn: Column<Formation>[] = [
	{
		header: 'Formation',
		key: "nom_formation"
	},
	{
		header: 'Créateur',
		key: "createur",
	},
	{
		header: "Action",
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} />
		}
		
	}
]

const FormationList = ({ formations } : { formations : Formation[]}) => {

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={formationTabColumn}
				data={formations}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default FormationList;