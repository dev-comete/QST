import { useBulletin } from "../../../other/hooks/bulletin/useBulletin";
import Box from "../../../system/atoms/Container/Box";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import BulletinList from "../../../system/molecules/List/BulletinList";
import BodyLayout from "../../layout/common/BodyLayout";

const BulletinReview = () => {

	const { bulletinList, bulletinListStatus } = useBulletin()

	if (bulletinListStatus == 'pending') return <Loading />

	if (!bulletinList) return <FetchError />

	return (
		<BodyLayout
			title={`Mes bulletins de notes`}
		>
			<Box className='space-y-5 space-x-3 justify-between min-h-0'>
				<BulletinList data={bulletinList}/>
			</Box>
		</BodyLayout>
	);
}

export default BulletinReview;