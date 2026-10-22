import type { ReactNode } from "react"
import type { RecentQuiz, Session } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"
import { PercentageBar } from "../../../molecules/Display/PercentageBar"
import StatusBadge from "../../../molecules/Badge/StatusBadge"

const DashboardItemBox = ({ children } : { children : ReactNode }) => {
	return (
		<Box className="p-3 border border-background w-full rounded-xl">
			{children}
		</Box>
	)
}

export const RecentQuizItem = ({ item } : { item : RecentQuiz}) => {

	const score = Number(item.completion.slice(0, item.completion.length - 1))

	return (
		<DashboardItemBox>
			<Box direction="column" className="w-full">
				<Box flexDirection="md:flex-row flex-col" className="items-center justify-between">
					<CustomText textTag="h3" weight="bold">{item.name}</CustomText>
					<StatusBadge value={item.status}/>
				</Box>
				<PercentageBar score={score}/>
			</Box>
		</DashboardItemBox>
	)
}

export const SessionsItem = ({ item } : { item : Session}) => {
	return (
		<DashboardItemBox>
			<CustomText>{item.name}</CustomText>
			<CustomText>{item.date}</CustomText>
		</DashboardItemBox>
	)
}