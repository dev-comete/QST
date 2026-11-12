import type { ComponentType, ReactNode } from "react"
import CustomText from "../../atoms/Text/CustomText"
import Paper from "../../atoms/Container/Paper"
import Box from "../../atoms/Container/Box"

export const ListItemBox = ({ children } : { children : ReactNode }) => {
	return (
		<Box className="p-3 border border-background w-full rounded-xl">
			{children}
		</Box>
	)
}

interface ListContainerProps <T>{
	title: string
	titleAction?: ReactNode
	data: T[]
	emptyText: string
	Item: ComponentType<{ item: T }>
}

const ListContainer = <T,>({ title, titleAction, data, Item, emptyText } : ListContainerProps<T>) => {
	return (
		<Paper className="flex flex-col gap-3 p-5 min-w-0 flex-1 items-center">
			<Box className="justify-between w-full">
				<CustomText weight="bold" textTag="h2" color="primary">{title}</CustomText>
				{titleAction}
			</Box>
			{
				data.length == 0 
				? <CustomText>{emptyText}</CustomText>
				:
				<Box direction="column" className="space-y-3 w-full">
					{
						data.map((item, index) => {
							return (
								<Item key={title + index} item={item} />
							)
						})
					}
				</Box>
			}
		</Paper>
	)
}

export default ListContainer;