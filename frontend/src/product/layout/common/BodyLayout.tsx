import Title from "../../../system/molecules/LayoutElement/Title";
import Box from "../../../system/atoms/Container/Box";
import type { ReactNode } from "react";

interface BodyLayoutProps {
	title: string,
	titleButton?: ReactNode,
	children: ReactNode,
	linkBack?: string
}

const BodyLayout = ({ title, titleButton, children, linkBack } : BodyLayoutProps) => {
	return (
		<Box direction="column" customStyling="p-10">
			<Title title={title} sideButton={titleButton} linkBack={linkBack}/>
			{children}
		</Box>
	)
}

export default BodyLayout;