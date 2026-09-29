import { useNavigate } from "react-router";
import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { BulletinVague } from "../../../../other/types/bulletinType";
import { formatDate } from "../../../../other/helper/helper";
import { useExportBulletin } from "../../../../other/hooks/bulletin/useBulletin";


const ActionCell = ({ rowId } : {
	rowId : string | number ,
}) => {
    const navigate = useNavigate();
	const { handleExportPdf, isExporting } = useExportBulletin();

    return (
        <Box className="flex items-center gap-3">
            <IconButton
                iconName={"book"}
                iconStyling="text-text hover:text-primary"
                action={() => {
					navigate(`/vague/${rowId}/bulletin`)
                }}
            />

			<IconButton
                iconName={isExporting ? "spinner" : "download"} 
                iconStyling={`text-text hover:text-success ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Exporter en PDF"
                action={() => {
                    if (!isExporting) {
                        handleExportPdf(rowId);
                    }
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
		render: (value) => formatDate(value as string)
	},
	{
		header: 'Date de fin',
		key: "fin",
		render: (value) => formatDate(value as string)
	},
	{
		header: null,
		key: 'vague_id',
		render: (value) => <ActionCell rowId={value as string ?? '0'} />
		
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