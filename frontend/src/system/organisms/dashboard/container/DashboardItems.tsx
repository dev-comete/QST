import type { ReactNode } from "react"
import type { RecentQuiz, Session } from "../../../../other/types/dashboardType"
import Box from "../../../atoms/Container/Box"
import CustomText from "../../../atoms/Text/CustomText"

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
			<Box>
				<CustomText>{item.name}</CustomText>
				<CustomText>{item.status}</CustomText>
			</Box>
			<CustomText>{item.completion}</CustomText>
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