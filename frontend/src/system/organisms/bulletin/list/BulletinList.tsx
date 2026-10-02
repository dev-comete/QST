import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { BulletinVague } from "../../../../other/types/bulletinType";
import { formatDate } from "../../../../other/helper/helper";
import { useExportBulletin } from "../../../../other/hooks/bulletin/useBulletin";
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation";


const ActionCell = ({ rowId } : {
	rowId : string | number ,
}) => {
	const { handleExportPdf, isExporting } = useExportBulletin();

    return (
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
    );
};

const quizTabColumn: Column<BulletinVague>[] = [
	{
		header: 'Vague',
		key: "nom_vague"
	},
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

	const { navigateTo } = useAppNavigation()

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={quizTabColumn}
				data={data}
				rowKey={'vague_id'}
				onRowClick={(row) => navigateTo(`/vague/${row.vague_id}/bulletin`)}
			/>
		</Box>
	)
}
export default BulletinList;