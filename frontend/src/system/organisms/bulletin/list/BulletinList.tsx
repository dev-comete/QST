import { useNavigate } from "react-router";
import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { BulletinVague } from "../../../../other/types/bulletinType";
import { formatDate } from "../../../../other/helper/helper";


const ActionCell = ({ rowId } : {
	rowId : string | number | boolean,
}) => {
    const navigate = useNavigate();

    return (
        <Box>
            <IconButton
                iconName={"book"}
                iconStyling="text-text hover:text-primary"
                action={() => {
					navigate(`/vague/${rowId}/bulletin`)
                }}
            />
        </Box>
    );
};

const quizTabColumn: Column<BulletinVague>[] = [
	{
		header: 'Formation',
		key: "formation_nom"
	},
	{
		header: 'Date de début',
		key: "debut",
		render: (value) => formatDate(value)
	},
	{
		header: 'Date de fin',
		key: "fin",
		render: (value) => formatDate(value)
	},
	{
		header: "Action",
		key: 'vague_id',
		render: (value) => <ActionCell rowId={value ?? '0'} />
		
	}
]

interface BulletinListProps {
	data: BulletinVague[],
}

const BulletinList = ({ data } : BulletinListProps) => {

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={quizTabColumn}
				data={data}
				rowKey={'vague_id'}
			/>
		</Box>
	)
}
export default BulletinList;