import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import { useUser, useUserDel } from "../../../../other/hooks/user/useUser"
import type { userType } from "../../../../other/types/userType"
import CustomText from "../../../atoms/Text/CustomText"

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
				confirmText="Voulez-vous vraiment supprimer l'utilisateur?"
            />
        </Box>
    );
};

const quizTabColumn: Column<userType>[] = [
	{
		header: 'Nom',
		key: "username"
	},
	{
		header: 'Email',
		key: "email"
	},
	{
		header: 'Type',
		key: "type_utilisateur"
	},
	{
		header: 'Organisation',
		key: "organisation",
		render: (value: string | number | string[] | null | undefined) => {
				const list = Array.isArray(value) ? value : []
				return (
					<Box>
						{list.map((item, index) => <CustomText key={index}>{String(item)}</CustomText>)}
					</Box>
				)
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

// Todo : Transform type and organisation to their corresponding name
const UserList = () => {

	const { getUserQuery } = useUser()
	const { data: users, status } = getUserQuery

	if (status == 'pending') {
		return <Loading />
	}
	
	if (!users)
		return <FetchError />

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={quizTabColumn}
				data={users}
				rowKey={'id'}
			/>
		</Box>
	)
}

export default UserList;