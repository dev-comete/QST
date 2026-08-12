import type { ReactNode } from "react";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";
import ActionButton from "../Buttons/ActionButton";
import { useNavigate } from "react-router";

interface TitleProps {
	title: string,
	sideButton?: ReactNode,
	linkBack?: string
}

const BackButton = ({ link } : { link : string}) => {
	const navigate = useNavigate()

	return (
		<ActionButton
			action={() => navigate(link)}
		>{"<-"}</ActionButton>
	)
}

const Title = ({ title, sideButton, linkBack } : TitleProps) => {

	const align = sideButton ? "justify-between" : "justify-center"
	return (
		<Box customStyling="w-full">
			<Box customStyling={`${align} items-center border-b border-text w-full pb-2`}>
				{ linkBack && <BackButton link={linkBack} />}
				<CustomText textTag="h1" weight="bold">{title}</CustomText>
				{sideButton}
			</Box>
		</Box>
	)
}

export default Title;