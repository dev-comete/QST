import type { ReactNode } from "react";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";
import { BackButton } from "../Buttons/BackButton";

interface TitleProps {
	title: string,
	sideButton?: ReactNode,
	linkBack?: string
	defaultLinkBack?: boolean
	info?: string
}

const Title = ({ title, sideButton, linkBack, defaultLinkBack = false, info } : TitleProps) => {
	
		return (
			<Box className="flex flex-col w-full border-b border-text pb-2">
				<Box className={`flex items-center gap-3 w-full justify-between`}>
					<Box className="flex items-center gap-3">
						{linkBack && <BackButton link={linkBack} />}
						{defaultLinkBack && <BackButton />}
						<CustomText textTag="h1" weight="bold">{title}</CustomText>
					</Box>
					{sideButton && (
						<Box className="justify-end">
							{sideButton}
						</Box>
					)}
				</Box>
				{ info && <CustomText textTag="h6">{info}</CustomText> }
			</Box>
		);
}

export default Title;