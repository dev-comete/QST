import { useParams } from "react-router";
import { useBulletin } from "../../../../other/hooks/bulletin/useBulletin";
import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import CustomText from "../../../../system/atoms/Text/CustomText";
import EvaluationList from "../../../../system/organisms/evaluation/list/EvaluationList";
import BodyLayout from "../../../layout/common/BodyLayout";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";

const BulletinDisplay = ({ title, value, unit } : { 
		title: string,
		value: string | number,
		unit?: string
	}) => {
	return (
		<Paper className="flex flex-col p-5 w-1/3 items-center">
			<CustomText>{title}</CustomText>
			<CustomText weight="bold" textTag="h1">{value}{unit}</CustomText>
		</Paper>
	)

}

const Bulletin = () => {
	const { id } = useParams()
	const { myBulletin, myBulletinStatus } = useBulletin(id)

	if (myBulletinStatus == 'pending') return <Loading />

	if (!myBulletin) return <FetchError />

	const { resume_global, details_quizzes } = myBulletin

	return (
		<BodyLayout
			title={"Bulletin de notes"}
			linkBack="/bulletin"
		>
				<Box className="items-start justify-center space-x-5 space-y-3">
					<BulletinDisplay
						title='Moyenne générale'
						value={resume_global.moyenne_generale_pct}
						unit="pts"
					/>
					<BulletinDisplay
						title='Score total'
						value={resume_global.total_score_obtenu + '/' + resume_global.total_score_possible}
					/>
					<BulletinDisplay
						title='Progression'
						value={resume_global.progression}
					/>
				</Box>
			<EvaluationList data={details_quizzes} />
		</BodyLayout>
	)
}

export default Bulletin;