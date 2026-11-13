// frontend/src/product/pages/formateur/vague/QuizAssignation.tsx
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import QuizVagueSelect from "../../../../system/organisms/vague/list/QuizVagueSelect";
import type { Dispatch, SetStateAction } from "react";
import AssignBloc from "../../../../system/organisms/quiz/container/AssignBloc";
import OwnedQuizList from "../../../../system/organisms/vague/list/OwnedQuizList";
import type { vagueQuiz } from "../../../../other/types/vagueType";

interface QuizAssignationProps {
    ownedQuiz: vagueQuiz[]
    quiz: number | null
    setQuiz: Dispatch<SetStateAction<number | null>>
    handleAssignQuiz: () => void
    isPending: boolean
    formationId: number
    vagueId: number // NEW PROP
}

const QuizAssignation = ({ ownedQuiz, quiz, setQuiz, handleAssignQuiz, isPending, formationId, vagueId } : QuizAssignationProps) => {
    return (
        <form className="flex flex-col md:flex-row justify-center gap-5 w-full items-start">
            <AssignBloc title="Sélection de quiz">
                <QuizVagueSelect setQuiz={setQuiz} formationId={formationId} />
                <ActionButton
                    type="submit"
                    onClick={(e) => {e.preventDefault() ; handleAssignQuiz()}}
                    btnColor={quiz ? "success" : "disabled"}
                    textColor="white"
                    disabled={quiz == null}
                    isLoading={isPending}
                    btnStyling="w-full mt-3"
                >
                    Assigner
                </ActionButton>
            </AssignBloc>
            
            <AssignBloc title="Quiz assignés">
                <OwnedQuizList ownedQuiz={ownedQuiz} vagueId={vagueId}/>
            </AssignBloc>
        </form>
    )
}

export default QuizAssignation;