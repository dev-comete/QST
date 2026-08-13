import { useLocation, useNavigate } from "react-router";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type React from "react";

interface NavButtonProps {
	link: string;
	children: React.ReactNode;
	className?: string
}

const NavButton = ({ link, children, className }: NavButtonProps) => {

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const isPathActive = pathname.includes(link);

	const btnStyling = isPathActive ? `border-l-5 border-l-accent` : 'hover:bg-primary-500';
	const btnColor = isPathActive ? `background` : 'primary';
	const textColor = isPathActive ? `text` : `white`;

	return (
		<Button
			className={btnStyling + " " + className}
			color={btnColor}
			action = { () => navigate(link) }
			isRounded={false}
		>
			<CustomText weight="bold" color={textColor}>
				{children}
			</CustomText>
		</Button>
	)
}

export default NavButton