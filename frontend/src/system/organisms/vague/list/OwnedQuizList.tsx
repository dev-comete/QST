// frontend/src/system/organisms/vague/list/OwnedQuizList.tsx
import type { vagueQuiz } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";
import { QuizStatusTag } from "../../quiz/tag/StatusTag";
import Box from "../../../atoms/Container/Box";
import { IconConfirmActionButton } from "../../../molecules/Buttons/IconButton";
import { useRemoveFromVague } from "../../../../other/hooks/vague/useAssignVague";

// Composant ActionCell pour le Quiz
const QuizActionCell = ({ quizId, vagueId }: { quizId: number, vagueId: number }) => {
    const { handleRemoveQuiz, isRemovingQuiz } = useRemoveFromVague(vagueId);
    return (
        <Box>
            <IconConfirmActionButton
                iconName="trash-can"
                iconStyling="text-text hover:text-error"
                action={() => handleRemoveQuiz(quizId)}
                confirmText="Voulez-vous vraiment désassigner ce quiz de la session ? (L'action sera bloquée si un étudiant l'a déjà commencé)."
                isLoading={isRemovingQuiz}
                title="Retirer le quiz"
            />
        </Box>
    );
};

const getOwnedQuizColumn = (vagueId: number): Column<vagueQuiz>[] => [
    {
        header: 'Nom',
        key: "titre"
    },
    {
        header: 'Statut',
        key: "status",
        render: (value) => <QuizStatusTag status={String(value)}/>
    },
    { 
        header: null, 
        key: 'id',
        render: (value) => <QuizActionCell quizId={Number(value)} vagueId={vagueId} />
    }
]

// Ajout de vagueId dans les props
interface OwnedQuizListProps {
    ownedQuiz: vagueQuiz[];
    vagueId: number;
}

const OwnedQuizList = ({ ownedQuiz, vagueId } : OwnedQuizListProps) => {
    return (
        <Table
            columns={getOwnedQuizColumn(vagueId)}
            data={ownedQuiz}
            rowKey={'id'}
            emptyTitle="Veuillez assigner des quiz à la session"
        />
    )
}

export default OwnedQuizList;