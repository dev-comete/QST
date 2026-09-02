import Title from "../../../system/molecules/LayoutElement/Title";
import Box from "../../../system/atoms/Container/Box";
import type { ReactNode } from "react";

interface BodyLayoutProps {
	title: string,
	titleButton?: ReactNode,
	children: ReactNode,
	linkBack?: string,
	footer?: ReactNode
	defaultLinkBack?: boolean
}

const BodyLayout = ({ title, titleButton, children, linkBack, footer, defaultLinkBack = false } : BodyLayoutProps) => {
    return (
        <Box direction="column" className="h-full min-h-0 w-full space-y-3">

            <Box direction="column" className="flex-none w-full px-10 pt-10">
                <Title
                    title={title}
                    sideButton={titleButton}
                    linkBack={linkBack}
					defaultLinkBack={defaultLinkBack}
                />
            </Box>

            <Box direction="column" className="flex-1 min-h-0 w-full overflow-y-auto px-10">
                {children}
            </Box>

            {footer && (
                <Box direction="column" className="flex-none w-full px-10 pb-10 mt-auto">
                    {footer}
                </Box>
            )}
        </Box>
    );
};

export default BodyLayout;