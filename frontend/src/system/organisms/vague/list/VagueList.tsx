import { useNavigate } from "react-router";
import Box from "../../../atoms/Container/Box";
import IconButton from "../../../molecules/Buttons/IconButton";
import { Table, type Column } from "../../../atoms/Table/Table";
import type { vagueType } from "../../../../other/types/vagueType";
import { useVague } from "../../../../other/hooks/vague/useVague";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import { formatDate } from "../../../../other/helper/helper";
import CustomText from "../../../atoms/Text/CustomText";

const ActionCell = ({ rowId } : {rowId : unknown }) => {
    const navigate = useNavigate();

    return (
        <Box>
            <IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => {
                    navigate(`/formateur/${rowId}/vague`);
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

const vagueTabColumn: Column<vagueType>[] = [
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
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} />
		}
		
	}
]

const VagueList = () => {

	const { getAllVague } = useVague()
	const { data: vagues, status } = getAllVague

	if (status == 'pending')
		return <Loading />
	
	if (!vagues)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={vagueTabColumn}
				data={vagues}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default VagueList;