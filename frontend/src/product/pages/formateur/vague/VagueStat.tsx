import { useParams } from "react-router";
import BodyLayout from "../../../layout/common/BodyLayout";
import { useVagueStat } from "../../../../other/hooks/vague/useVague";
import Loading from "../../../../system/atoms/Loading/Loading";
import FetchError from "../../../../system/atoms/Loading/FetchError";

const VagueStat = () => {

	const { id } = useParams()

	const { data, isPending } = useVagueStat(id ?? '')

	if (isPending) return <Loading />

	if (!data) return <FetchError />

	return (
		<BodyLayout
			title="Statistique de la vague"
			defaultLinkBack
		>
			<>{id}</>
		</BodyLayout>
	)
}

export default VagueStat;