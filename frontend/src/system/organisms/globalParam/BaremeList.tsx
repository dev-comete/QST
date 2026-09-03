import { useDelBareme } from "../../../other/hooks/bareme/useBareme";
import type { baremeType } from "../../../other/types/questionType";
import Box from "../../atoms/Container/Box";
import { Table, type Column } from "../../atoms/Table/Table";
import IconButton from "../../molecules/Buttons/IconButton";

const ActionCell = ({ rowId } : {rowId : number }) => {

	const { handleDelUser } = useDelBareme(rowId)
    return (
        <Box>
            <IconButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={handleDelUser}
            />
        </Box>
    );
};

const formationTabColumn: Column<baremeType>[] = [
	{
		header: 'Points',
		key: "pts"
	},
	{
		header: "Action",
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={Number(value)} />
		}
		
	}
]

const BaremeList = ({ baremes } : { baremes : baremeType[]}) => {

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={formationTabColumn}
				data={baremes}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default BaremeList;