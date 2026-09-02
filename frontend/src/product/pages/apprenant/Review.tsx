import { useParams } from "react-router";
import { useReviewQuiz } from "../../../other/hooks/quiz/useReviewQuiz";
import Box from "../../../system/atoms/Container/Box";
import CorrectionBloc, { CorrectionBlocNav } from "../../../system/organisms/quiz/container/CorrectionBloc";
import BodyLayout from "../../layout/common/BodyLayout";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";
import { ScoreDisplay } from "../../../system/molecules/Display/ScoreDisplay";

const Review = () => {

	const { id : quizId } = useParams();

	const { review, status } = useReviewQuiz(quizId ?? '')

	if (status == 'pending') return <Loading />

	if (!review) return <FetchError />

	return (
		<BodyLayout
			title={`Résultat du quiz : ${review.quiz_id}`}
			defaultLinkBack={true}
		>
			<Box className='space-y-5 space-x-3 justify-between min-h-0'>
				<Box direction="column" className="w-1/3">
					<ScoreDisplay score={review.score_final}/>
					<CorrectionBlocNav corrections={review.corrections}/>
				</Box>
				<Box className="w-2/3">
					<CorrectionBloc corrections={review.corrections}/>
				</Box>
			</Box>
		</BodyLayout>
	);
}

export default Review;