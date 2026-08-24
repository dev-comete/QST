import { useLocation, useNavigate } from "react-router";
import Button from "../../atoms/Button/Button"
import CustomText from "../../atoms/Text/CustomText";
import type React from "react";
import Box from "../../atoms/Container/Box";
import FAIcon from "../../atoms/Icon/FAIcon";

interface NavButtonProps {
	link: string;
	icon?: string;
	children: React.ReactNode;
	className?: string
}

const NavButton = ({ link, children, icon, className }: NavButtonProps) => {

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const isPathActive = pathname.includes(link);

	const btnStyling = isPathActive ? `border-l-5 border-l-primary` : 'hover:bg-secondary';
	const btnColor = isPathActive ? `background` : 'white';
	const textColor = isPathActive ? `primary` : `text`;

	return (
		<Button
			className={btnStyling + " " + className}
			color={btnColor}
			action = { () => navigate(link) }
			isRounded={false}
		>
			<Box className="items-center pl-5">
				{icon && <FAIcon name={icon} className={`text-${textColor}`}/>}
				<CustomText weight="bold" color={textColor}>
					{children}
				</CustomText>
			</Box>
		</Button>
	)
}

export default NavButton