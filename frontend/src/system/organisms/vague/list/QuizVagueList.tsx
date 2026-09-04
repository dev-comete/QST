import type { Dispatch, SetStateAction } from "react";
import Loading from "../../../atoms/Loading/Loading";
import FetchError from "../../../atoms/Loading/FetchError";
import Select from "../../../atoms/Form/Select";
import { getSelectData } from "../../../../other/helper/helper";
import useQuiz from "../../../../other/hooks/quiz/useQuiz";

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
		<Select 
			id={"type"}
			name={"type"}
			selectionValue={getSelectData(data, 'id')}
			label="Barème"
			handleChange={(e: any) => setQuiz(e.target.value)}
		/>
	)
}

export default QuizVagueList;