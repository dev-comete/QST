import Title from "../../../system/molecules/LayoutElement/Title";
import Box from "../../../system/atoms/Container/Box";
import type { ReactNode } from "react";

interface BodyLayoutProps {
	title: string,
	titleButton?: ReactNode,
	children: ReactNode
}

const BodyLayout = ({ title, titleButton, children } : BodyLayoutProps) => {
	return (
		<Box customStyling="p-10" direction="column">
			<Title title={title} sideButton={titleButton}/>
			{children}
		</Box>
	)
}

export default BodyLayout;