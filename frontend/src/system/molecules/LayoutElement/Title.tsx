import type { ReactNode } from "react";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";
import { BackButton } from "../Buttons/CustomizedButton";

interface TitleProps {
	title: string,
	subtitle?: ReactNode,
	sideButton?: ReactNode,
	linkBack?: string
	defaultLinkBack?: boolean
	info?: string
	titleTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

const Title = ({ title, sideButton, linkBack, defaultLinkBack = false, info, titleTag = 'h1', subtitle } : TitleProps) => {
	
		return (
			<Box className="flex flex-col w-full border-b border-text-light pb-2">
				<Box className={`flex items-center gap-3 w-full justify-between`}>
					<Box className="flex items-center gap-3">
						{linkBack && <BackButton link={linkBack} />}
						{defaultLinkBack && <BackButton />}
						<Box>
							<CustomText textTag={titleTag} weight="bold">{title}</CustomText>
							{subtitle}
						</Box>
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