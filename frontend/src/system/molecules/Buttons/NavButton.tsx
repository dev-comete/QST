// frontend/src/system/molecules/Buttons/NavButton.tsx
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
    badge?: number; 
}

const NavButton = ({ link, children, icon, className = '' , isSidebarOpen = true, badge}: NavButtonProps) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isPathActive = pathname.includes(link);
    
    const btnStyling = isPathActive
        ? 'bg-primary/10 shadow-sm ring-1 ring-primary/20'
        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700';
    const textColor = isPathActive ? 'primary' : 'text';
    const iconColor = isPathActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500';
    const tooltipText = typeof children === 'string' ? children : undefined;

    return (
        <Button
            title={tooltipText}
            color="transparent" 
            isRounded={false} 
            onClick={() => navigate(link)}
            className={`group !w-full ${isSidebarOpen ? '!px-4' : '!px-0'} !py-3 rounded-xl transition-all duration-300 ease-in-out ${btnStyling} ${className} relative`}
        >
            <Box direction="row" className={`items-center w-full transition-all duration-300 ${isSidebarOpen ? 'gap-3 justify-start' : 'justify-center'}`}>
                {icon && (
                    <Box className="relative">
                        <FAIcon 
                            name={icon} 
                            className={`text-[1.1rem] flex-shrink-0 transition-colors ${iconColor}`}
                        />
                        {/* Badge version menu replié (mobile ou sidebar fermée) */}
                        {!isSidebarOpen && badge !== undefined && badge > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-sm">
                                {badge > 9 ? '9+' : badge}
                            </span>
                        )}
                    </Box>
                )}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-1 items-center justify-between ${isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
                    <CustomText 
                        weight={isPathActive ? "bold" : "normal"} 
                        color={textColor}
                        className="truncate text-left"
                    >
                        {children}
                    </CustomText>
                    {/* Badge version menu ouvert */}
                    {badge !== undefined && badge > 0 && (
                        <span className="ml-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </div>
            </Box>
        </Button>
    )
}

export default NavButton;