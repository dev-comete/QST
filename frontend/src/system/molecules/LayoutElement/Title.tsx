import type { ReactNode } from "react";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";

interface TitleProps {
	title: string,
	sideButton?: ReactNode
}

const Title = ({ title, sideButton } : TitleProps) => {

	const align = sideButton ? "justify-between" : "justify-center"
	return (
		<Box customStyling="w-full">
			<Box customStyling={`${align} items-center border-b border-text w-full pb-2`}>
				<CustomText textTag="h1" weight="bold">{title}</CustomText>
				{sideButton}
			</Box>
		</Box>
	)
}

export default Title;