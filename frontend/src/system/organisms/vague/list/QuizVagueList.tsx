import type { Dispatch, SetStateAction } from "react";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import Select from "../../../atoms/Form/Select";
import { getSelectData } from "../../../../other/helper/helper";
import { useQuiz } from "../../../../other/hooks/quiz/useQuiz";
import Box from "../../../atoms/Container/Box";

interface QuizVagueListProps {
	setQuiz: Dispatch<SetStateAction<number | null>>
}

const QuizVagueList = ({ setQuiz } : QuizVagueListProps) => {

	const { getAllQuiz } = useQuiz()

	const { data, status } = getAllQuiz

	if (status == 'pending')
		return <Loading />
	if (!data)
		return <FetchError />

	return (
		<Box className="min-w-1/4">
			<Select 
				id={"type"}
				name={"type"}
				selectionValue={getSelectData(data, 'titre')}
				label="Sélection de quiz"
				handleChange={(e) => {
					const quizName = e.target.value
					const selectedQuiz = data.find((q) => q.titre == quizName)
					console.log("Selected quiz", selectedQuiz)
					setQuiz(Number(selectedQuiz?.id))
				}}
			/>
		</Box>
	)
}

export default QuizVagueList;