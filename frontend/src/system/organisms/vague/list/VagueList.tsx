import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { vagueType } from "../../../../other/types/vagueType";
import { useVague } from "../../../../other/hooks/vague/useVague";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { formatDate } from "../../../../other/helper/helper";
import CustomText from "../../../atoms/Text/CustomText";
import { useState, type Dispatch, type SetStateAction } from "react";
import VagueAssign from "../../../../product/pages/formateur/vague/VagueAssign";

const ActionCell = ({ rowId, setSelectedId }: { 
    rowId: string | number | boolean | string[]
	onEdit?: (id: string | number | boolean | string[]) => void
	setSelectedId: Dispatch<SetStateAction<number | null>>
}) => {   

	// const { handleDelVague } = useVagueDel(rowId as number)

    return (
        <Box>
            <IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => setSelectedId(Number(rowId))}
            />
        </Box>
    );
};

const getVagueTabColumn = (
	setSelectedId: Dispatch<SetStateAction<number | null>>
) : Column<vagueType>[] => [
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
		header: "Inscription",
		key: 'etudiants',
		render: (value) => {
			const count = Array.isArray(value) ? value.length : 0;
			return <CustomText>{`${count} apprenant${count > 0 ? 's' : ''}`}</CustomText>
		}
		
	},
	{
		header: "Action",
		key: 'id',
		render: (_value, _row, index) => {
			return <ActionCell rowId={index ? index : 0} setSelectedId={setSelectedId}/>
		}
		
	}
]

const VagueList = () => {

	const { getAllVague } = useVague()
	const { data: vagues, status } = getAllVague
	const [ selectedId, setSelectedId ] = useState<number | null>(null)

	if (status == 'pending')
		return <Loading />
	
	if (!vagues)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
		{selectedId === null && <Table 
				columns={getVagueTabColumn(setSelectedId)}
				data={vagues}
				rowKey={'id'}
			/>
		}
		{
			selectedId != null && 
			<VagueAssign
				ownedStudents={vagues[selectedId].etudiants}
				setSelectedId={setSelectedId}
				vagueId={vagues[selectedId].id}
			/>
		}
		</Box>
	)
}

export default VagueList;