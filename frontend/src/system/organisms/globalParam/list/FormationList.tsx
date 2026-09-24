import { useState } from "react";
import { useDelFormation } from "../../../../other/hooks/formation/useFormation";
import type { Formation } from "../../../../other/types/formationType";
import Box from "../../../atoms/Container/Box";
import { Table, type Column } from "../../../atoms/Table/Table";
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import ModalEditFormation from "../form/ModalEditFormation";
import { useUser } from "../../../../other/hooks/user/useUser";
import FetchError from "../../../atoms/Loading/FetchError";
import Loading from "../../../atoms/Loading/Loading";
import type { userType } from "../../../../other/types/userType";
import CustomText from "../../../atoms/Text/CustomText";

const ActionCell = ({ rowId, onEdit }: { 
    rowId: string | number | boolean | string[]
    onEdit: (id: string | number | boolean | string[]) => void 
}) => {    

	const { handleDelFormation, isPending } = useDelFormation(rowId as string)

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
                action={handleDelFormation}
                confirmText="Voulez-vous vraiment supprimer la formation?"
                isLoading={isPending}
            />
        </Box>
    );
};

const getFormationTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void,
	listUser: userType[]
): Column<Formation>[] => [
	{
		header: 'Formation',
		key: "nom_formation"
	},
	{
		header: 'Créateur',
		key: "createur",
		render: (value) => {
			const role = listUser.find((t) => t.id === value)
			return <CustomText textTag="h4">{role?.username}</CustomText>
		}
	},
	{
		header: null,
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} onEdit={onEdit} />
		}
		
	}
]

const FormationList = ({ formations } : { formations : Formation[]}) => {

	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { getUserQuery } = useUser({})
	const { data: listUser, isPending } = getUserQuery

	if (isPending) return <Loading />

	if (!listUser) return <FetchError />

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedUserId(id as string)
		setIsModalOpen(true)
	}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={getFormationTabColumn(
					handleOpenEditModal,
					listUser
				)}
				data={formations}
				rowKey={'id'}
			/>
			<ModalEditFormation 
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				id={selectedUserId}
			/>
		</Box>
	)
}

export default FormationList;