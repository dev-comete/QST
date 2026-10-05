import { useState } from "react";
import type { vagueStatQuiz } from "../../../../other/types/vagueType";
import { Table, type Column } from "../../../atoms/Table/Table";
import ModalVagueStat from "../modal/ModalVagueStat";
import PercentBadge from "../../../molecules/Badge/PercentBadge";
import CustomText from "../../../atoms/Text/CustomText";

const vagueStatTabColumn : Column<vagueStatQuiz>[] = [
	{
		header: 'Titre du quiz',
		key: "quiz_titre"
	},
	{
		header: 'Moyenne de la classe',
		key: "moyenne_classe",
		render: (value, row) => <CustomText>{`${value}/${row.points_maximum}pts`}</CustomText>
	},
	{
		header: 'Taux de réussite',
		key: "taux_reussite_pct",
		render: (value) => <PercentBadge value={value}/>
	}
]


const VagueStatList = ({ vagueList } : { vagueList : vagueStatQuiz[]}) => {

	const [selectedQuiz, setSelectedQuiz] = useState<vagueStatQuiz | null>(null);

	return (
		<>
			<Table
				columns={vagueStatTabColumn}
				data={vagueList}
				rowKey={'quiz_id'}
				onRowClick={(_row, index) => setSelectedQuiz(vagueList[index])}
			/>
			{
				selectedQuiz &&
				<ModalVagueStat
					selectedQuiz={selectedQuiz}
					setSelectedQuiz={setSelectedQuiz}
				/>

			}
		</>
	)
}

export default VagueStatList;