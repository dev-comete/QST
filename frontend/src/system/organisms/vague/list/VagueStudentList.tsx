// frontend/src/system/organisms/vague/list/VagueStudentList.tsx
import type { etudiantType } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";
import Box from "../../../atoms/Container/Box";
import { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import { useRemoveFromVague } from "../../../../other/hooks/vague/useAssignVague";

// Composant ActionCell pour l'étudiant
const StudentActionCell = ({ studentId, vagueId }: { studentId: number, vagueId: number }) => {
    const { handleRemoveStudent, isRemovingStudent } = useRemoveFromVague(vagueId);
    return (
        <Box>
            <IconConfirmActionButton
                iconName="user-minus"
                iconStyling="text-text hover:text-error"
                action={() => handleRemoveStudent(studentId)}
                confirmText="Voulez-vous vraiment retirer cet étudiant de l'équipe ? Cela n'est possible que s'il n'a pas encore commencé d'évaluation."
                isLoading={isRemovingStudent}
                title="Retirer de l'équipe"
            />
        </Box>
    );
};

// On passe vagueId pour l'utiliser dans la colonne
const getOwnedStudentColumn = (vagueId: number): Column<etudiantType>[] => [
    {
        header: 'Nom',
        key: "username"
    },
    {
        header: 'Email',
        key: "email",
    },
    { 
        header: null, 
        key: 'etudiant_id',
        render: (value) => <StudentActionCell studentId={Number(value)} vagueId={vagueId} />
    }
]

// Ajout de vagueId dans les props
interface VagueStudentListProps {
    ownedStudents: etudiantType[];
    vagueId: number; 
}

const VagueStudentList = ({ ownedStudents, vagueId } : VagueStudentListProps) => {
    return (
        <Table
            columns={getOwnedStudentColumn(vagueId)}
            data={ownedStudents}
            rowKey={'etudiant_id'}
            emptyTitle="Veuillez assigner des étudiants à la session"
        />
    )
}

export default VagueStudentList;