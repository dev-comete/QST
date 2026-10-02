import type { ReactNode } from "react"
import type { RecentQuiz, Session } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"
import PercentBadge from "../../../molecules/Badge/PercentBadge"

const DashboardItemBox = ({ children } : { children : ReactNode }) => {
	return (
		<Box className="p-3 border border-background w-full rounded-xl">
			{children}
		</Box>
	)
}

export const RecentQuizItem = ({ item } : { item : RecentQuiz}) => {
	return (
		<DashboardItemBox>
			<Box className="justify-between w-full">
				<CustomText>{item.name}</CustomText>
				<Box className="space-x-3">
					<CustomText className="border border-background shadow-sm p-2 rounded-xl">{item.status}</CustomText>
					<PercentBadge value={Number(item.completion.slice(0, item.completion.length - 1))}/>
				</Box>
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