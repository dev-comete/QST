import { useParams } from "react-router";
import { useReviewQuiz } from "../../../other/hooks/quiz/useReviewQuiz";
import Box from "../../../system/atoms/Container/Box";
import QuizReviewBloc from "../../../system/organisms/quiz/container/QuizReviewBloc";
import BodyLayout from "../../layout/common/BodyLayout";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";

const Review = () => {

	const { id : quizId } = useParams();
 
	const { correction, status } = useReviewQuiz(quizId ?? '')

	if (status == 'pending') return <Loading />

	if (!correction) return <FetchError />

	return (
		<BodyLayout
			title={`Revue`}
		>
			<Box direction='column' className='space-y-5 items-center'>
				<QuizReviewBloc correction={correction}/>
			</Box>
		</BodyLayout>
	);
}

export default Review;