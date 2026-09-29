import { useLocation, useNavigate } from "react-router";
import Button from "../../atoms/Button/Button";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import type React from "react";
import FAIcon from "../../atoms/Icon/FAIcon";

interface NavButtonProps {
    link: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
	isSidebarOpen?: boolean;
}

const NavButton = ({ link, children, icon, className = '' , isSidebarOpen = true}: NavButtonProps) => {

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isPathActive = pathname.includes(link);

    // [ALTERED CODE]: Modern "Soft Pill" styling 
    const btnStyling = isPathActive 
        ? 'bg-primary/10 shadow-sm ring-1 ring-primary/20' 
        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700';

    const textColor = isPathActive ? 'primary' : 'text';
    const iconColor = isPathActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500';

    const tooltipText = typeof children === 'string' ? children : undefined;

    return (
        <Button
            title={tooltipText}
            // [ALTERED CODE]: Pass 'transparent' so Button doesn't apply a solid background, allowing our bg-primary/10 to show
            color="transparent" 
            // We set this to false so we can apply rounded-xl instead of the default rounded-lg
            isRounded={false} 
            onClick={() => navigate(link)}
            className={`group !w-full ${isSidebarOpen ? '!px-4' : '!px-0'} !py-3 rounded-xl transition-all duration-300 ease-in-out ${btnStyling} ${className}`}
        >
            {/* [ALTERED CODE]: Brought back Box atom to handle flex alignment */}
            <Box direction="row" className={`items-center w-full transition-all duration-300 ${isSidebarOpen ? 'gap-3 justify-start' : 'justify-center'}`}>
                {icon && (
                    <FAIcon 
                        name={icon} 
                        className={`text-[1.1rem] flex-shrink-0 transition-colors ${iconColor}`}
                    />
                )}
				<div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
					<CustomText 
                    weight={isPathActive ? "bold" : "normal"} 
                    color={textColor}
                    className="truncate text-left w-full"
					>
						{children}
					</CustomText>
				</div>
            </Box>
        </Button>
    )
}

export default NavButton;