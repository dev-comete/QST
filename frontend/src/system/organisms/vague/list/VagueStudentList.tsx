// frontend/src/system/organisms/vague/list/VagueStudentList.tsx
import type { etudiantType } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";
import Box from "../../../atoms/Container/Box";
import { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import IconButton from "../../../molecules/Buttons/IconButton";
import { useRemoveFromVague } from "../../../../other/hooks/vague/useAssignVague";
import { useNavigate } from "react-router";

interface StudentActionCellProps {
    studentId: number;
    vagueId: number;
    quizId?: number; // Pour afficher la revue d'un quiz spécifique
}

// Composant ActionCell pour l'étudiant
const StudentActionCell = ({ studentId, vagueId, quizId }: StudentActionCellProps) => {
    const { handleRemoveStudent, isRemovingStudent } = useRemoveFromVague(vagueId);
    const navigate = useNavigate();

    return (
        <Box className="flex space-x-2 items-center">
            {/* Bouton Voir la copie (affiché uniquement si on est dans le contexte d'un quiz) */}
            {quizId && (
                <IconButton 
                    iconName="eye"
                    action={() => navigate(`/quiz/${quizId}/revue?vague_id=${vagueId}&student_id=${studentId}`)}
                    title="Voir la copie de l'étudiant"
                />
            )}

            {/* Bouton Télécharger le Bulletin */}
            <IconButton 
                iconName="file-pdf"
                action={() => navigate(`/vague/${vagueId}/bulletin?student_id=${studentId}`)}
                title="Consulter le bulletin de l'étudiant"
            />

            {/* Bouton Retirer */}
            <IconConfirmActionButton
                iconName="user-minus"
                iconStyling="text-text hover:text-error"
                action={async () => handleRemoveStudent(studentId)}
                confirmText="Voulez-vous vraiment retirer cet étudiant de l'équipe ? Cela n'est possible que s'il n'a pas encore commencé d'évaluation."
                isLoading={isRemovingStudent}
                title="Retirer de l'équipe"
            />
        </Box>
    );
};

// On passe vagueId et quizId pour l'utiliser dans la colonne
const getOwnedStudentColumn = (vagueId: number, quizId?: number): Column<etudiantType>[] => [
    {
        header: 'Nom',
        key: "username"
    },
    {
        header: 'Email',
        key: "email",
    },
    { 
        header: 'Actions', 
        key: 'etudiant_id',
        render: (value) => <StudentActionCell studentId={Number(value)} vagueId={vagueId} quizId={quizId} />
    }
]

// Ajout de quizId dans les props
interface VagueStudentListProps {
    ownedStudents: etudiantType[];
    vagueId: number; 
    quizId?: number; 
}

const VagueStudentList = ({ ownedStudents, vagueId, quizId } : VagueStudentListProps) => {
    return (
        <Table
            columns={getOwnedStudentColumn(vagueId, quizId)}
            data={ownedStudents}
            rowKey={'etudiant_id'}
            emptyTitle="Veuillez assigner des étudiants à la session"
        />
    )
}

export default VagueStudentList;