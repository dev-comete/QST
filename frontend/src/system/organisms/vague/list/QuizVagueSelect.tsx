import type { Dispatch, SetStateAction } from "react";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import Select from "../../../atoms/Form/Select";
import { getSelectData } from "../../../../other/helper/helper";
import { useQuiz } from "../../../../other/hooks/quiz/useQuiz";
import Box from "../../../atoms/Container/Box";
import CustomText from "../../../atoms/Text/CustomText";

interface QuizVagueListProps {
	setQuiz: Dispatch<SetStateAction<number | null>>
	formationId: number
}

const QuizVagueSelect = ({ setQuiz, formationId } : QuizVagueListProps) => {

	const { getAllQuiz } = useQuiz({})

	const { data, status } = getAllQuiz

	if (status == 'pending')
		return <Loading />
	if (!data)
		return <FetchError />

	const compatibleQuizzes = data.filter((quiz) => Number(quiz.formation) === Number(formationId))

	if (compatibleQuizzes.length === 0) {
		return (
			<Box className="w-full">
				<CustomText>
					Aucun quiz disponible pour cette formation.
				</CustomText>
			</Box>
		)
	}

	return (
		<Box className="w-full">
			<Select 
				id={"type"}
				name={"type"}
				selectionValue={getSelectData(compatibleQuizzes, 'titre')}
				label="Sélection de quiz"
				handleChange={(e) => {
					const quizName = e.target.value
					const selectedQuiz = compatibleQuizzes.find((q) => q.titre == quizName)
					setQuiz(selectedQuiz ? Number(selectedQuiz.id) : null)
				}}
			/>
		</Box>
	)
}

export default QuizVagueSelect;