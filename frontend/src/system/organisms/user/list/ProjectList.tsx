import Box from "../../../atoms/Container/Box"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton, { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton"
import type { projectType } from "../../../../other/types/userType"
import { formatDate } from "../../../../other/helper/helper"
import ModalProjectEdit from "../form/ModalEditProject"
import { useState } from "react"
import { useProjectDel } from "../../../../other/hooks/user/useProject"
import { StatusTag } from "../../quiz/tag/StatusTag"

const ActionCell = ({ rowId, onEdit } : { 
	rowId: string | number | boolean | string[]
	onEdit: (id: string | number | boolean | string[]) => void
}) => {

	const { handleDelProject, isPending } = useProjectDel(Number(rowId))

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
                action={handleDelProject}
				confirmText="Voulez-vous vraiment supprimer le projet?"
				isLoading={isPending}
            />
        </Box>
    );
};

const getOrgTabColumn = (
    onEdit: (id: string | number | boolean | string[]) => void
): Column<projectType>[] => [
	{
		header: 'Nom',
		key: "nom"
	},
	{
		header: 'Date de création',
		key: "date_creation",
		render: (val) => formatDate(val)
	},
	{
		header: 'Statut',
		key: "is_active",
		render: (val) => {
			const stat = val == true ? 'Actif' : 'Inactif'
			return <StatusTag status={stat}/>
		}
	},
	{
		header: null,
		key: 'id',
		render: (value) => {
			return <ActionCell rowId={value ? value : ''} onEdit={onEdit}/>
		}
		
	}
]

const ProjectList = ({ projects } : { projects : projectType[]}) => {

	const [selectedId, setSelectedId] = useState<string>('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleOpenEditModal = (id: string | number | boolean | string[]) => {
		setSelectedId(id as string)
		setIsModalOpen(true)
	}

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table
				columns={getOrgTabColumn(handleOpenEditModal)}
				data={projects}
				rowKey={'id'}
			/>
			<ModalProjectEdit 
				id={selectedId}
				open={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
			/>
		</Box>
	)
}

export default ProjectList;