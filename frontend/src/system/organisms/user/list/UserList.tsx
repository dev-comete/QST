import { useState } from "react"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import { useUser, useUserDel } from "../../../../other/hooks/user/useUser"
import type { organisationType, userType } from "../../../../other/types/userType"
import CustomText from "../../../atoms/Text/CustomText"
import ModalUserUpdate from "../form/ModalUpdateUser"

const ActionCell = ({ 
    rowId, 
    onEdit 
}: { 
    rowId: string | number | boolean | string[]
    onEdit: (id: string | number | boolean | string[]) => void 
}) => {
    const { handleDelUser, isPending } = useUserDel(rowId as string)

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
                action={handleDelUser}
                confirmText="Voulez-vous vraiment supprimer l'utilisateur?"
                isLoading={isPending}
            />
        </Box>
    );
};

// Function returning column configuration
const getQuizTabColumns = (
    onEdit: (id: string | number | boolean | string[]) => void
): Column<userType>[] => [
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
            return <ActionCell rowId={value ? value : ''} onEdit={onEdit} />
        }
    }
]

interface UserListProps {
	organisations: organisationType[]
}

const UserList = ({ organisations } : UserListProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleOpenEditModal = (id: string | number | boolean | string[]) => {
        setSelectedUserId(id as string)
        setIsModalOpen(true)
    }

    const { getUserQuery } = useUser({})
    const { data: users, status } = getUserQuery

    if (status === 'pending') return <Loading />
    
    if (!users) return <FetchError />

    return (
        <Box direction="column" className="w-full items-center justify-center">
            <Table 
                columns={getQuizTabColumns(handleOpenEditModal)}
                data={users}
                rowKey={'id'}
            />

			<ModalUserUpdate 
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				listOrganisation={organisations}
				id={selectedUserId}
			/>
        </Box>
    )
}

export default UserList;