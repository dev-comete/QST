import type { ReactNode } from "react";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import Box from "../../../atoms/Container/Box";

const AssignBloc = ({title, children} : { title: string, children : ReactNode}) => {
	return (
		<Paper className="flex flex-col items-center rounded-xl p-5 h-full">
			<CustomText weight="bold" textTag="h1">{title}</CustomText>
			<Box direction="column" className="justify-center h-4/5 overflow-y-auto items-center">
				{children}
			</Box>
		</Paper>
	)
}

export default AssignBloc;