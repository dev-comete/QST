import type { ReactNode } from "react";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import Box from "../../../atoms/Container/Box";

const AssignBloc = ({title, children} : { title: string, children : ReactNode}) => {
	return (
		<Paper className="flex flex-col items-center rounded-xl p-5 gap-5 min-w-0 flex-1 w-full">
			<CustomText weight="bold" textTag="h1">{title}</CustomText>
			<Box direction="column" className="w-full justify-center overflow-y-auto items-stretch">
				{children}
			</Box>
		</Paper>
	)
}

export default AssignBloc;