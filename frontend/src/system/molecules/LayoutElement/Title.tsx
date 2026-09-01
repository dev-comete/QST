import type { ReactNode } from "react";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";
import IconButton from "../Buttons/IconButton";
import { useAppNavigation } from "../../../other/hooks/navigation/useAppNavigation";

interface TitleProps {
	title: string,
	sideButton?: ReactNode,
	linkBack?: string
}

const BackButton = ({ link } : { link : string}) => {

	const { navigateTo } = useAppNavigation()

	return (
		<IconButton 
			iconName="chevron-left"
			action={() => navigateTo(link)}
			btnStyling="rounded-full bg-white"
		/>
	)
}

const Title = ({ title, sideButton, linkBack } : TitleProps) => {

		if (linkBack && sideButton) {
			return (
				<Box className="w-full border-b border-text pb-2">
					<Box className="grid grid-cols-3 items-center w-full">
						<Box className="justify-start">
							<BackButton link={linkBack} />
						</Box>
						<Box className="justify-center text-center">
							<CustomText textTag="h1" weight="bold">{title}</CustomText>
						</Box>
						<Box className="justify-end">
							{sideButton}
						</Box>
					</Box>
				</Box>
			);
		}

		const justifyClass = !linkBack && !sideButton 
			? "justify-center" 
			: "justify-between";
	
		return (
			<Box className="w-full border-b border-text pb-2">
				<Box className={`flex items-center gap-3 w-full ${justifyClass}`}>
					<Box className="flex items-center gap-3">
						{linkBack && <BackButton link={linkBack} />}
						<CustomText textTag="h1" weight="bold">{title}</CustomText>
					</Box>
					{sideButton && (
						<Box className="justify-end">
							{sideButton}
						</Box>
					)}
				</Box>
			</Box>
		);
}

export default Title;