import Title from "../../../system/molecules/LayoutElement/Title";
import Box from "../../../system/atoms/Container/Box";
import type { ReactNode } from "react";

const BodyLayout = ({ title, children } : { title: string, children: ReactNode}) => {
	return (
		<Box>
			<Title title={title}/>
			{children}
		</Box>
	)
}

export default BodyLayout;