import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import type { utilisateurType } from "../../../../other/types/userType"

// const ActionCell = ({ rowId, onEdit } : { 
// 	rowId: string | number | boolean | string[]
// 	onEdit: (id: string | number | boolean | string[]) => void
// }) => {

// 	const { handleDelProject, isPending } = useProjectDel(Number(rowId))

//     return (
//         <Box>
// 			<IconButton
//                 iconName="edit"
//                 iconStyling="text-text hover:text-success"
//                 action={() => onEdit(rowId)}
// 				title="Modifier"
//             />
//             <IconConfirmActionButton
//                 iconName="trash"
//                 iconStyling="text-text hover:text-error"
//                 action={handleDelProject}
// 				confirmText="Voulez-vous vraiment supprimer le projet?"
// 				isLoading={isPending}
// 				title="Supprimer"
//             />
//         </Box>
//     );
// };

const getUserTypeTabColumn = (
): Column<utilisateurType>[] => [
	{
		header: 'Type d\'utilisateur',
		key: "type_utilisateur"
	},
	{
		header: 'ID',
		key: "id"
	},
	// {
	// 	header: null,
	// 	key: 'id',
	// 	render: (value) => {
	// 		return <ActionCell rowId={value ? value : ''} onEdit={onEdit}/>
	// 	}
		
	// }
]

const UserTypeList = ({ userType } : { userType : utilisateurType[]}) => {

	// const [selectedId, setSelectedId] = useState<string>('')
	// const [isModalOpen, setIsModalOpen] = useState(false)

	// const handleOpenEditModal = (id: string | number | boolean | string[]) => {
	// 	setSelectedId(id as string)
	// 	setIsModalOpen(true)
	// }

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={getUserTypeTabColumn()}
				data={userType}
				rowKey={'id'}
			/>
			{/* <ModalProjectEdit 
				id={selectedId}
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
			/> */}
		</Box>
	)
}

export default UserTypeList;