import Box from "../../../system/atoms/Container/Box";
import QuizReviewBloc from "../../../system/organisms/quiz/container/QuizReviewBloc";
import BodyLayout from "../../layout/common/BodyLayout";

const Review = () => {
	return (
		<BodyLayout
			title={`Revue`}
		>
			<Box direction='column' className='space-y-5 items-center'>
				<QuizReviewBloc />
			</Box>
		</BodyLayout>
	);
}

export default Review;