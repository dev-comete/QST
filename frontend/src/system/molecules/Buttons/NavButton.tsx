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
    className?: string
}

const NavButton = ({ link, children, icon, className = '' }: NavButtonProps) => {

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
            // [ALTERED CODE]: Using !w-full, !px-4, !py-3 to override the Button's default w-fit and padding
            className={`group !w-full !px-4 !py-3 rounded-xl transition-all duration-200 ease-in-out ${btnStyling} ${className}`}
        >
            {/* [ALTERED CODE]: Brought back Box atom to handle flex alignment */}
            <Box direction="row" className="items-center gap-3 w-full">
                {icon && (
                    <FAIcon 
                        name={icon} 
                        className={`text-[1.1rem] flex-shrink-0 transition-colors ${iconColor}`}
                    />
                )}
                <CustomText 
                    weight={isPathActive ? "bold" : "normal"} 
                    color={textColor}
                    className="truncate text-left w-full"
                >
                    {children}
                </CustomText>
            </Box>
        </Button>
    )
}

export default NavButton;