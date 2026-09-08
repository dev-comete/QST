import { useState } from "react"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import { useUser, useUserDel } from "../../../../other/hooks/user/useUser"
import type { organisationType, userType, utilisateurType } from "../../../../other/types/userType"
import CustomText from "../../../atoms/Text/CustomText"
import ModalUserUpdate from "../form/ModalUpdateUser"

const ActionCell = ({ rowId, onEdit }: { 
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

const getUserTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void,
	listOrganisation: organisationType[],
	listType: utilisateurType[]
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
        key: "type_utilisateur",
		render: (value) => {
			const role = listType.find((t) => t.id === value)
			return <CustomText textTag="h4">{role?.type_utilisateur}</CustomText>
		}
    },
    {
        header: 'Organisation',
        key: "organisation",
        render: (value: string | number | number[] | string[] | null | undefined) => {
            const list = Array.isArray(value) ? value : []

			if (list.length === 0) return <CustomText textTag="h5">Aucune</CustomText>

            return (
                <Box>
                    {
						list.map((item, index) =>{
							const found = listOrganisation.find((org) => org.id === item)
						return <CustomText textTag="h4" key={index}>{found?.nom}</CustomText>
					})}
                </Box>
            )
        }
    },
    {
        header: "Action",
        key: 'id',
        render: (value) => {
            return <ActionCell rowId={Number(value)} onEdit={onEdit} />
        }
    }
]

interface UserListProps {
	organisations: organisationType[]
}

const UserList = ({ organisations } : UserListProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)
	
    const { getUserQuery, getUserTypeQuery } = useUser({})
    const { data: users, status } = getUserQuery
	const { data: types, status : typeStatus } = getUserTypeQuery

    if (status === 'pending' || typeStatus == 'pending') 
		return <Loading />
    
    if (!users || !types)
		return <FetchError />

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedUserId(id as string)
        setIsModalOpen(true)
    }

    return (
        <Box direction="column" className="w-full items-center justify-center">
            <Table 
                columns={getUserTabColumn(
                    handleOpenEditModal,
                    organisations,
					types
                )}
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