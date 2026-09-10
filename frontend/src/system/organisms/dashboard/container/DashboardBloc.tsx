import type { ComponentType } from "react"
import Paper from "../../../atoms/Container/Paper"
import CustomText from "../../../atoms/Text/CustomText"
import Box from "../../../atoms/Container/Box"

interface DashboardBlocProps <T>{
	title: string
	data: T[]
	emptyText: string
	Item: ComponentType<{ item: T }>}

const DashboardBloc = <T,>({ title, data, Item, emptyText } : DashboardBlocProps<T>) => {
	return (
		<Paper className="flex flex-col gap-3 p-5 flex-1 min-w-0 items-center">
			<CustomText weight="bold" textTag="h2" color="primary">{title}</CustomText>
			{
				data.length == 0 
				? <CustomText>{emptyText}</CustomText>
				:
				<Box direction="column" className="space-y-3 w-full">
					{
						data.map((item, index) => {
							return (
								<Item key={title + index} item={item}/>
							)
						})
					}
				</Box>
			}
		</Paper>
	)
}

export default DashboardBloc;