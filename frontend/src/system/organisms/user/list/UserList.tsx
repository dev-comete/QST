// frontend/src/system/organisms/user/list/UserList.tsx
import { useState } from "react"
import Box from "../../../atoms/Container/Box"
import FetchError from "../../../atoms/Loading/FetchError"
import Loading from "../../../atoms/Loading/Loading"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
// IMPORT du nouveau hook
import { useTypeUser, useUser, useUserDel, useUserReactivate } from "../../../../other/hooks/user/useUser"
import type { projectType, userType, utilisateurType } from "../../../../other/types/userType"
import CustomText from "../../../atoms/Text/CustomText"
import ModalUserUpdate from "../form/ModalUpdateUser"
import { UserRoleTag } from "../../quiz/tag/StatusTag"
import { useAuth } from "../../../../other/hooks/auth/useAuth"


/* ==========================================
   ANCIEN CODE : ActionCell
   ==========================================
const ActionCell = ({ rowId, onEdit }: { 
    rowId: string | number | boolean | string[]
    onEdit: (id: string | number | boolean | string[]) => void 
}) => {
    const { handleDelUser, isPending } = useUserDel(rowId as string)
    const { authUser } = useAuth()
    return (
        <Box>
            <IconButton
                iconName="edit"
                iconStyling="text-text hover:text-success"
                action={() => onEdit(rowId)}
                title="Modifier"
            />
            {authUser?.id != rowId && <IconConfirmActionButton 
                iconName="trash" 
                iconStyling="text-text hover:text-error" 
                action={handleDelUser} 
                confirmText="Voulez-vous vraiment désactiver l'utilisateur?" 
                isLoading={isPending} 
                title="Désactiver" 
            />}
        </Box>
    );
};
*/

// NOUVEAU CODE : ActionCell (Gère la corbeille)
const ActionCell = ({ rowId, onEdit, listType }: { 
    rowId: string | number | boolean | string[]
    onEdit: (id: string | number | boolean | string[]) => void 
    listType: 'default' | 'trash'
}) => {
    const { handleDelUser, isPending: delPending } = useUserDel(rowId as string)
    const { handleReactivateUser, isPending: reactivatePending } = useUserReactivate(rowId as string)
    const { authUser } = useAuth()
    
    return (
        <Box>
            {listType === 'trash' ? (
                <IconConfirmActionButton 
                    iconName="rotate-left" 
                    iconStyling="text-text hover:text-primary" 
                    action={handleReactivateUser} 
                    confirmText="Voulez-vous vraiment réactiver cet utilisateur ?" 
                    isLoading={reactivatePending} 
                    title="Réactiver" 
                />
            ) : (
                <>
                    <IconButton
                        iconName="edit"
                        iconStyling="text-text hover:text-success"
                        action={() => onEdit(rowId)}
                        title="Modifier"
                    />
                    {authUser?.id != rowId && (
                        <IconConfirmActionButton 
                            iconName="user-slash" 
                            iconStyling="text-text hover:text-error" 
                            action={handleDelUser} 
                            confirmText="Voulez-vous vraiment désactiver l'utilisateur ?" 
                            isLoading={delPending} 
                            title="Désactiver" 
                        />
                    )}
                </>
            )}
        </Box>
    );
};

// NOUVEAU CODE : getUserTabColumn (On passe listType)
const getUserTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void,
    listProject: projectType[],
    listTypeUser: utilisateurType[],
    listType: 'default' | 'trash'
): Column<userType>[] => [
    {
        header: 'Rôle',
        key: "type_utilisateur",
        render: (value) => {
            const role = listTypeUser.find((t) => t.id === value)
            return <UserRoleTag role={role?.type_utilisateur ?? ''}/>
        }
    },
    {
        header: 'Nom',
        key: "username"
    },
    {
        header: 'Email',
        key: "email"
    },
    {
        header: 'Projets',
        key: "organisation",
        render: (value: string | number | number[] | string[] | null | undefined) => {
            const list = Array.isArray(value) ? value : []
            if (list.length === 0) return <CustomText textTag="h5" className="text-center">Aucun</CustomText>
            return (
                <Box direction="row" className="justify-center max-w-50 flex-wrap">
                    { list.map((item, index) =>{
                        const found = listProject.find((org) => org.id === item)
                        return <CustomText key={index} textTag="h6" className="border border-background rounded-xl px-1.5 py-1 shadow-sm" >{found?.nom}</CustomText>
                    })}
                </Box>
            )
        }
    },
    {
        header: null,
        key: 'id',
        render: (value) => {
            return <ActionCell rowId={Number(value)} onEdit={onEdit} listType={listType} />
        }
    }
]

/* ==========================================
   ANCIEN CODE : UserListProps & UserList
   ==========================================
interface UserListProps {
    projects: projectType[]
}
// ...
*/

// NOUVEAU CODE : UserListProps & UserList
interface UserListProps {
    projects: projectType[];
    listType?: 'default' | 'trash'; // Ajout de la prop listType
}

const UserList = ({ projects, listType = 'default' } : UserListProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    const { getUserQuery } = useUser({})
    const { data: users, status } = getUserQuery
    const { userTypes, userTypePending } = useTypeUser()
    
    if (status === 'pending' || userTypePending)  return <Loading />
         
    if (!users || !userTypes) return <FetchError />

    // On filtre localement selon le statut listType
    // (Assurez-vous que l'API renvoie `is_active` dans l'objet utilisateur)
    const filteredUsers = users.filter((u) =>
        listType === 'trash' ? u.is_active === false : u.is_active !== false
    );

    const handleOpenEditModal = (id: string | number | boolean | string[]) => {
        setSelectedUserId(id as string)
        setIsModalOpen(true)
    }

    return (
        <Box direction="column" className="w-full items-center justify-center">
            <Table 
                columns={getUserTabColumn(
                    handleOpenEditModal,
                    projects, 
                    userTypes,
                    listType
                )}
                data={filteredUsers}
                rowKey={'id'}
                emptyTitle={listType === 'trash' ? "La corbeille des utilisateurs est vide." : "Aucun utilisateur actif trouvé."}
            />
            
            <ModalUserUpdate
                open={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                listProject={projects}
                id={selectedUserId}
            />
        </Box>
    )
}

export default UserList;